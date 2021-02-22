// #[macro_use]
// extern crate lazy_static;
//extern crate libc;
use std::mem;
use std::ptr;
use std::slice;
use std::cmp;
use std::sync::RwLock;
use wchar::{wch, wch_c};
use std::process::Command;
use std::thread;
use std::time::Duration;
use std::sync::Arc;
use std::env;


// zipfile stuff
use std::io::prelude::*;
use std::io::{Seek, Write};
use std::iter::Iterator;
use zip::result::ZipError;
use zip::write::FileOptions;
use zip;
use std::fs::File;
use std::path::Path;
use walkdir::{DirEntry, WalkDir};


//use libc::size_t;

#[repr(C)] pub struct JSContext { _private: [u8; 0] }
#[repr(C)] pub struct JSObject { _private: [u8; 0] }
type JSNativeValue = i64;
type JSBool = i64;
type JSNativeCall = extern "C" fn(ctx: *const JSContext, obj: *const JSObject, argc: u32, argv: *const JSNativeValue, rval: *mut JSNativeValue);
type JSString = *const u16;
type JSBytes = *const u8;

//unsafe impl Sync for *const JSContext {}





//static mut MMENV: RwLock<MM_Envitonment> = RwLock::new(MM_Envitonment::new());
static mut MMENV: Option<MM_Envitonment> = None;
fn jsenv<'a>() -> &'a MM_Envitonment {
    unsafe { MMENV.as_ref().unwrap() }
}


#[repr(C)]
#[derive(Debug)]
pub struct MM_Envitonment {
    lib_obj: *const JSObject,
    define_function: Option<extern "C" fn(lib_obj: *const JSObject, name: JSString, call: JSNativeCall, nargs: u32) -> JSBool>,
    value_to_string: Option<extern "C" fn(ctx: *const JSContext, val: JSNativeValue, length: *mut u32) -> JSString>,
    value_to_bytes: Option<extern "C" fn(ctx: *const JSContext, val: JSNativeValue, length: *mut u32) -> JSBytes>,
    value_to_integer: Option<extern "C" fn(ctx: *const JSContext, val: JSNativeValue, res: *mut i64) -> JSBytes>,
    value_to_double: Option<extern "C" fn(ctx: *const JSContext, val: JSNativeValue, res: *mut f64) -> JSBool>,
    value_to_boolean: Option<extern "C" fn(ctx: *const JSContext, val: JSNativeValue, res: *mut i64) -> JSBool>,
    value_to_object: Option<extern "C" fn(ctx: *const JSContext, val: JSNativeValue, res: *mut *mut JSObject) -> JSBool>,
    string_to_value: Option<extern "C" fn(ctx: *const JSContext, val: JSString, length: u32, res: *mut JSNativeValue) -> JSBool>,
    bytes_to_value: Option<extern "C" fn(ctx: *const JSContext, val: JSBytes, length: u32, res: *mut JSNativeValue) -> JSBool>,
    double_to_value: Option<extern "C" fn(ctx: *const JSContext, val: f64, length: u32, res: *mut JSNativeValue) -> JSBool>,
    object_type: Option<extern "C" fn(*const JSObject) -> JSString>,
    new_array_object: Option<extern "C" fn(ctx: *const JSContext, length: u32, res: *mut JSNativeValue) -> *const JSObject>,
    get_array_length: Option<extern "C" fn(ctx: *const JSContext, object: *const JSObject) -> u64>,
    get_element: Option<extern "C" fn(ctx: *const JSContext, object: *const JSObject, idx: u32, val: *mut JSNativeValue) -> JSBool>,
    set_element: Option<extern "C" fn(ctx: *const JSContext, object: *const JSObject, idx: u32, val: *const JSNativeValue) -> JSBool>,
    execute_script: Option<extern "C" fn(ctx: *const JSContext, object: *const JSObject, script: JSString, length: u32, file: JSString, line: u32, *mut JSNativeValue) -> JSBool>,
    report_error: Option<extern "C" fn(ctx: *const JSContext, err: JSString, length: u32) -> JSBool>
}

//unsafe impl Sync for *mut MM_Envitonment {}

impl MM_Envitonment {
    fn new() -> MM_Envitonment {
        MM_Envitonment {
            lib_obj: ptr::null(),
            define_function: None,
            value_to_string: None,
            value_to_bytes: None,
            value_to_integer: None,
            value_to_double: None,
            value_to_boolean: None,
            value_to_object: None,
            string_to_value: None,
            bytes_to_value: None,
            double_to_value: None,
            object_type: None,
            new_array_object: None,
            get_array_length: None,
            get_element: None,
            set_element: None,
            execute_script: None,
            report_error: None
        }
    }
}

#[no_mangle]
pub extern "C" fn MM_InitWrapper(env: *const MM_Envitonment, env_size: u32) {
    unsafe {
        let mut mmenv = MM_Envitonment::new();
        let mm_size = mem::size_of::<MM_Envitonment>();
        let mut mm_ptr = (&mut mmenv as *mut MM_Envitonment).cast::<u8>();
        let env_ptr = env.cast::<u8>();
        ptr::copy(env_ptr, mm_ptr, cmp::min(env_size as usize, mm_size));
        MMENV = Some(mmenv);
        println!("ZipFile library registered");
    }

    define_function(jsenv().lib_obj, "compress", compress, 2);
}

// create zero-terminates JSString
fn to_jsstr(s: &str) -> JSString {
    let mut sv:Vec<u16> = s.encode_utf16().collect();
    sv.push(0);
    return sv.as_ptr();
}

fn from_jsstr(s: JSString) -> String {
    unsafe {
        let mut len = 0;
        let mut sptr = s;
        while *sptr != 0 {
            sptr = sptr.add(1);
            len += 1;
        }
        dbg!(len);
        dbg!(slice::from_raw_parts(s, len));
        String::from_utf16(slice::from_raw_parts(s, len)).unwrap()
    }
}

fn from_sized_jsstr(s: JSString, l: usize) -> String {
    unsafe {
        String::from_utf16(slice::from_raw_parts(s, l)).unwrap()
    }
}

fn define_function(obj: *const JSObject, name: &str, call: JSNativeCall, nargs: u32) {
    let env = jsenv();

    if let Some(df) = env.define_function {
        if df(obj, to_jsstr(name), call, nargs) > 0 {
            println!("Defined function {0}", name);
            return;
        }
    }
    println!("Can't define function {0}", name);
}

fn value_to_string(ctx: *const JSContext, value: JSNativeValue) -> String {
    unsafe {
        let env = jsenv();
        if let Some(v2s) = env.value_to_string {
            let mut len = 0u32;
            let s = v2s(ctx, value, &mut len);
            return from_sized_jsstr(s, len as usize);
        }
    }
    return "".to_string();
}

fn string_to_value(ctx: *const JSContext, value: String) -> JSNativeValue {
    unsafe {
        let env = jsenv();
        if let Some(s2v) = env.string_to_value {
            let mut result = ptr::null_mut::<JSNativeValue>();
            if s2v(ctx, to_jsstr(value.as_str()), 0, result) != 0 {
                return *result;
            }
        }
        return 0;
    }
}   

fn array_get_element(ctx: *const JSContext, array: JSNativeValue, idx: u32) -> JSNativeValue {
    unsafe {
        let env = jsenv();
        let mut result: JSNativeValue = 0;
        let mut array_obj = ptr::null_mut::<*mut JSObject>();
        if let Some(v2o) = env.value_to_object {
            if !v2o(ctx, array, array_obj) == 0 {
                return 0;
            }
            if let Some(get) = env.get_element {
                if !get(ctx, *array_obj, idx, &mut result) == 0 {
                    return 0;
                }
                return result;
            }
        }
        return 0;
    }
}

fn execute_script(ctx: *const JSContext, script: &str) -> JSNativeValue {
    let env = jsenv();
    
    if let Some(eval) = env.execute_script {
        let mut res = 0;
        //let resptr: *mut JSNativeValue = &mut res;
        if eval(ctx, env.lib_obj, to_jsstr(script), 0, to_jsstr(script), 0, &mut res) > 0 {
            println!("Script executed, result = {0}, stringified = '{1}'", res, value_to_string(ctx, res));
            return res;
        } else {
            println!("Error while executing script");
        }
        return res;
    }
    
    return 0;
}

fn object_type(obj: *const JSObject) -> String {
    if let Some(objtype) = jsenv().object_type {
        return from_jsstr(objtype(obj))
    } else {
        "".to_string()
    }
}

fn error(ctx: *const JSContext, rval: *mut JSNativeValue, message: &str) {
    println!("ZipFile error: {}", message);
    //unsafe { *rval = string_to_value(ctx, message.to_string()) };
}

fn success(ctx: *const JSContext, rval: *mut JSNativeValue, message: &str) {
    println!("ZipFile success: {}", message);
    unsafe { *rval = 0 };
}

// #

pub extern "C" fn compress(ctx: *const JSContext, obj: *const JSObject, argc: u32, argv: *const JSNativeValue, rval: *mut JSNativeValue) {
    println!("Hello world!");
    let args = unsafe { slice::from_raw_parts(argv, argc as usize) };
    if args.len() < 2 {
        return error(ctx, rval, "No enougth arguments");
    }
    let src_path = value_to_string(ctx, args[0]);
    let dst_path = value_to_string(ctx, args[1]);
    println!("archiving {} -> {}", src_path, dst_path);
    // unsafe {
    //     *rval = execute_script(ctx, "(function(){fl.trace('hello from rust!');fl.trace('hello from rust2!');})()");
    // };
    //return error(ctx, rval, "Ok!");

    {
        if !Path::new(&src_path).is_dir() {
            return error(ctx, rval, "Source path is not dirrectory");
        }

        let path = Path::new(&dst_path);
        let file = File::create(&path).unwrap();

        let method = zip::CompressionMethod::Deflated;
        let walkdir = WalkDir::new(&src_path);
        let it = walkdir.into_iter();
        zip_dir(&mut it.filter_map(|e| e.ok()), &src_path, &file, method).unwrap();
        return success(ctx, rval, "Successfully compressed");
    }
}

fn zip_dir<T>(
    it: &mut dyn Iterator<Item = DirEntry>,
    prefix: &str,
    writer: T,
    method: zip::CompressionMethod,
) -> zip::result::ZipResult<()>
where
    T: Write + Seek,
{
    //return Result::Ok(());
    let mut zip = zip::ZipWriter::new(writer);
    let options = FileOptions::default()
        .compression_method(method)
        .unix_permissions(0o755);

    let mut buffer = Vec::new();
    for entry in it {
        let path = entry.path();
        let name = path.strip_prefix(Path::new(prefix)).unwrap();

        // Write file or directory explicitly
        // Some unzip tools unzip files with directory paths correctly, some do not!
        if path.is_file() {
            println!("adding file {:?} as {:?} ...", path, name);
            #[allow(deprecated)]
            zip.start_file_from_path(name, options)?;
            let mut f = File::open(path)?;

            f.read_to_end(&mut buffer)?;
            zip.write_all(&*buffer)?;
            buffer.clear();
        } else if name.as_os_str().len() != 0 {
            // Only if not root! Avoids path spec / warning
            // and mapname conversion failed error on unzip
            println!("adding dir {:?} as {:?} ...", path, name);
            #[allow(deprecated)]
            zip.add_directory_from_path(name, options)?;
        }
    }
    zip.finish()?;
    Result::Ok(())
}