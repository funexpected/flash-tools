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



use clap::Clap;
use std::io::prelude::*;
use std::io::{Seek, Write};
use std::iter::Iterator;
use zip::write::FileOptions;
use zip;
use std::fs::File;
use std::path::Path;
use walkdir::{DirEntry, WalkDir};

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
    Compress(Compress),
}

/// Copress target folder into destination path using zip
#[derive(Clap)]
struct Compress {
    /// Source folder
    #[clap(long, short)]
    source: String,
    /// Destination file
    #[clap(long, short)]
    destination: String,

}


fn main() {
    let opts: Opts = Opts::parse();
    match opts.subcmd {
        SubCommand::Compress(c) => {
            let file = File::create(&c.destination).unwrap();
            let method = zip::CompressionMethod::Deflated;
            let walkdir = WalkDir::new(&c.source);
            let it = walkdir.into_iter();
            compress(&mut it.filter_map(|e| e.ok()), &c.source, &file, method).unwrap();
        }
    }
}

fn compress<T>(
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
            #[allow(deprecated)]
            zip.start_file_from_path(name, options)?;
            let mut f = File::open(path)?;

            f.read_to_end(&mut buffer)?;
            zip.write_all(&*buffer)?;
            buffer.clear();
        } else if name.as_os_str().len() != 0 {
            // Only if not root! Avoids path spec / warning
            // and mapname conversion failed error on unzip
            #[allow(deprecated)]
            zip.add_directory_from_path(name, options)?;
        }
    }
    zip.finish()?;
    Result::Ok(())
}
