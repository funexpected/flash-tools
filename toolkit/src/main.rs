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

mod prelude;
mod update;
mod compress;


//use clap::Clap;
// use std::fs::File;
// use std::path::Path;
// use walkdir::{DirEntry, WalkDir};
// use std::error::Error;

// use github_rs::client::{Executor, Github};
//use serde::{Deserialize, Serialize};
//use serde_json::Value;
// use reqwest;

use crate::prelude::*;

/// Command-line toolkit for interacting between Funexpected Tools 
/// jsfl extention and native stuff
#[derive(Clap)]
#[clap(version = "1.0", author = "Yakov Borevich <j.borevich@gmail.com>")]
struct Opts {
    #[clap(subcommand)]
    subcmd: SubCommand,
}

#[derive(Clap)]
enum SubCommand {
    Compress(compress::Compress),
    Update(update::Update),
}

/// Copress target folder into destination path using zip
// #[derive(Clap)]
// struct Compress {
//     /// Source folder
//     #[clap(long, short)]
//     source: String,
//     /// Destination file
//     #[clap(long, short)]
//     destination: String,

// }

fn main() {
    let opts: Opts = Opts::parse();
    match opts.subcmd {
        SubCommand::Compress(cmd) => {
            match cmd.execute() {
                Ok(value) => success(serde_json::to_value(value).unwrap()),
                Err(msg) => error(msg.to_string())
            }
        },
        SubCommand::Update(cmd) => {
            match cmd.execute() {
                Ok(value) => success(serde_json::to_value(value).unwrap()),
                Err(msg) => error(msg.to_string())
            }
        }
    }
}

// fn compress<T>(
//     it: &mut dyn Iterator<Item = DirEntry>,
//     prefix: &str,
//     writer: T,
//     method: zip::CompressionMethod,
// ) -> zip::result::ZipResult<()>
// where
//     T: Write + Seek,
// {
//     //return Result::Ok(());
//     let mut zip = zip::ZipWriter::new(writer);
//     let options = FileOptions::default()
//         .compression_method(method)
//         .unix_permissions(0o755);

//     let mut buffer = Vec::new();
//     for entry in it {
//         let path = entry.path();
//         let name = path.strip_prefix(Path::new(prefix)).unwrap();

//         // Write file or directory explicitly
//         // Some unzip tools unzip files with directory paths correctly, some do not!
//         if path.is_file() {
//             #[allow(deprecated)]
//             zip.start_file_from_path(name, options)?;
//             let mut f = File::open(path)?;

//             f.read_to_end(&mut buffer)?;
//             zip.write_all(&*buffer)?;
//             buffer.clear();
//         } else if name.as_os_str().len() != 0 {
//             // Only if not root! Avoids path spec / warning
//             // and mapname conversion failed error on unzip
//             #[allow(deprecated)]
//             zip.add_directory_from_path(name, options)?;
//         }
//     }
//     zip.finish()?;
//     Result::Ok(())
// }


// fn decompress(path: &std::path::Path, outdir: &std::path::Path) {
//     // let args: Vec<_> = std::env::args().collect();
//     // if args.len() < 2 {
//     //     println!("Usage: {} <filename>", args[0]);
//     //     return 1;
//     // }
//     // let path = std::path::Path::new(&*args[1]);
//     let file = File::open(path).unwrap();

//     let mut archive = zip::ZipArchive::new(file).unwrap();

//     for i in 0..archive.len() {
//         let mut file = archive.by_index(i).unwrap();
//         let outpath = match file.enclosed_name() {
//             Some(path) => outdir.join(path).to_owned(),
//             None => continue,
//         };

//         {
//             let comment = file.comment();
//             if !comment.is_empty() {
//                 println!("File {} comment: {}", i, comment);
//             }
//         }

//         if (&*file.name()).ends_with('/') {
//             println!("File {} extracted to \"{}\"", i, outpath.display());
//             std::fs::create_dir_all(&outpath).unwrap();
//         } else {
//             println!(
//                 "File {} extracted to \"{}\" ({} bytes)",
//                 i,
//                 outpath.display(),
//                 file.size()
//             );
//             if let Some(p) = outpath.parent() {
//                 if !p.exists() {
//                     std::fs::create_dir_all(&p).unwrap();
//                 }
//             }
//             let mut outfile = File::create(&outpath).unwrap();
//             std::io::copy(&mut file, &mut outfile).unwrap();
//         }

//         // Get and Set permissions
//         #[cfg(unix)]
//         {
//             use std::os::unix::fs::PermissionsExt;

//             if let Some(mode) = file.unix_mode() {
//                 std::fs::set_permissions(&outpath, std::fs::Permissions::from_mode(mode)).unwrap();
//             }
//         }
//     }
// }