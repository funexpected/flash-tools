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
use crate::compress::decompress;

use github_rs::client::{Executor, Github};
use reqwest;

/// Update to the latest version
#[derive(Clap)]
pub struct Update {
    /// Current app version
    #[clap(long, short)]
    from_version: String
}

impl Update {
    pub fn execute(&self) -> Res<UpdateResult> {
        let client = Github::new("bb6fd4eddf585aa78065a1730cd24a6612f60621").unwrap();
        let repo_owner = "funexpected";
        let repo_name = "flash-tools";
        //let repo_name = "godot";
        let repo_enpoint = format!("repos/{}/{}/releases/latest", repo_owner, repo_name);
        let (_headers, status, json) = client.get()
            .custom_endpoint(&repo_enpoint)
            .execute::<Value>()?;
        
        if status != 200 {
            return err("No release found");
        }
        let release: Release = serde_json::from_value(json.unwrap()).unwrap();
        if !release.is_version_higher(&self.from_version) {
            return Ok(UpdateResult::create("already_latest", None, None));
        }
        if let Some(asset) = release.assets.iter().find(|a| a.name == "funexpected-tools.zip") {
            let current_exe = std::env::current_exe()?;
            let working_dir = current_exe.parent().unwrap();
            let extract_dir = working_dir.join("out");
            let update_dir = working_dir.join("update");
            let zip_path = working_dir.join("funexpected.zip");
            let mut file = File::create(zip_path.as_path())?;
            file.write_all(reqwest::blocking::get(asset.browser_download_url.as_str())?.bytes()?.as_ref())?;
            decompress(zip_path.as_path(), extract_dir.as_path());
            if let Some(fntools_dir) = WalkDir::new(&extract_dir).into_iter().filter_map(|e| e.ok()).find(|e| e.file_name() == "Funexpected Tools") {
                if update_dir.exists() {
                    std::fs::remove_dir_all(&update_dir)?;
                }
                std::fs::rename(fntools_dir.path(), &update_dir)?;
                std::fs::remove_dir_all(extract_dir)?;
                std::fs::remove_file(zip_path)?;
                return Ok(UpdateResult::create("updated", Some(&update_dir), Some(release.version())));
            } else {
                return err("No `Funexpected Tools` folder found in update");
            }

        } else {
            return err("No `funexpected-tools.zip` asset found in released update");
        }
    }
}

#[derive(Serialize, Deserialize)]
struct Asset {
    name: String,
    browser_download_url: String
}
#[derive(Serialize, Deserialize)]
struct Release {
    tag_name: String,
    assets: Vec<Asset>
}
impl Release {

    fn version(&self) -> String {
        self.tag_name.trim_start_matches('v').to_string()
    }

    fn is_version_higher(&self, version: &String) -> bool {
        let release_parts = self.tag_name.trim_start_matches('v').split('.').map(|p| p.parse::<u32>().unwrap_or(0)).collect::<Vec<u32>>();
        let current_parts = version.trim_start_matches('v').split('.').map(|p| p.parse::<u32>().unwrap_or(0)).collect::<Vec<u32>>();
        for i in 0..release_parts.len() {
            if i >= current_parts.len() {
                return true;
            }
            if release_parts[i] > current_parts[i] {
                return true;
            }

            if release_parts[i] < current_parts[i] {
                return false;
            } 
        }
        return false;
    }
}

#[derive(Serialize, Deserialize)]
pub struct UpdateResult {
    status: String,
    path: Option<String>,
    version: Option<String>
}

impl UpdateResult {
    fn create(status: &str, path: Option<&Path>, version: Option<String>) -> UpdateResult {
        UpdateResult {
            status: status.to_string(),
            path: path.map(|p| p.to_str().unwrap().to_string()),
            version
        }
    }
}