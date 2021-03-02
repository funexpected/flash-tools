// MIT License

// Copyright (c) 2021 Yakov Borevich, Funexpected LLC

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

use crate::prelude::*;

use std::env;
use std::fs;
use std::io;
use glob::glob;
use dirs;

const COMMANDS_FOLDERS: &str = if cfg!(target_os = "macos") {
    "Library/Application Support/Adobe/Animate*/*/Configuration/Commands/"
} else {
    "AppData/Local/Adobe/Animate*/*/Configuration/Commands/"
};

/// Install plugin from current folder
#[derive(Clap)]
pub struct Install {
    
}

fn copy_dir_all(src: impl AsRef<Path>, dst: impl AsRef<Path>) -> io::Result<()> {
    fs::create_dir_all(&dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let ty = entry.file_type()?;
        if ty.is_dir() {
            copy_dir_all(entry.path(), dst.as_ref().join(entry.file_name()))?;
        } else {
            fs::copy(entry.path(), dst.as_ref().join(entry.file_name()))?;
        }
    }
    Ok(())
}


impl Install {
    pub fn execute(&self) -> Res<Value> {
        let home = dirs::home_dir().unwrap();
        let folders = format!("{}/{}", home.to_str().unwrap(), COMMANDS_FOLDERS);
        let current_exe = env::current_exe()?;
        let working_dir = current_exe.parent().unwrap();
        println!("Walking folders {}", folders);
        for entry in glob(&folders).unwrap() {
            let path = &entry?;
            println!("found folder {:?}", path);
            let fun_dir = path.join("Funexpected Tools");
            if fun_dir.exists() {
                fs::remove_dir_all(&fun_dir);
            }
            copy_dir_all(working_dir, fun_dir)?;
        }
        return Ok(Value::Null);
    }
}