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

pub use std::fs::File;
pub use std::path::Path;
pub use std::error::Error;
pub use std::io::{Seek, Write};

pub use clap::Clap;
pub use serde::{Deserialize, Serialize};
pub use serde_json::Value;
pub use walkdir::{DirEntry, WalkDir};

pub type Res<T> = std::result::Result<T, Box<dyn std::error::Error>>;

#[derive(Serialize, Deserialize)]
struct ToolkitResult {
    success: bool,
    message: Option<String>,
    result: Option<Value>
}

fn write_result(success: bool, message: Option<String>, result: Option<Value>) {
    let current_exe = std::env::current_exe().unwrap();
    let working_dir = current_exe.parent().unwrap();
    let mut file = File::create(working_dir.join("result.json").as_path()).unwrap();
    let result = ToolkitResult {
        success, message, result
    };
    file.write_all(serde_json::to_string(&result).unwrap().as_bytes()).unwrap();
}

pub fn success(result: Value) {
    write_result(true, None, Some(result));
}

pub fn error(message: String) {
    write_result(false, Some(message), None);
}


#[derive(Debug)]
struct InvokeError {
    message: String
}

impl std::fmt::Display for InvokeError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.message)
    }
}


impl Error for InvokeError {}

pub fn err<T>(message: &str) -> Res<T> {
    return Err(Box::new(InvokeError { message: message.to_string() }));
}