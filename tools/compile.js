const fs = require('fs');
const { execSync } = require('child_process');
const { exit } = require('process');

const SrcDir = 'out/tsc'
const DestDir = 'out/compiled'

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

if (fs.existsSync(DestDir)) fs.rmdirSync(DestDir, { recursive: true });
fs.readdirSync(SrcDir + '/commands').forEach(cmd => {
    let destFileName = cmd.substr(0, cmd.length-3).split("_").map(p => p.capitalize()).join(" ") + ".jsfl";
    let command = `npx google-closure-compiler --js=${SrcDir}/lib/** --js=${SrcDir}/commands/${cmd} --language_out ECMASCRIPT3 --js_output_file=${DestDir}/${cmd} --force_inject_library=es6_runtime --module_resolution=node --process_common_js_modules=true`
    console.log(`comiling ${cmd}`)
    let result = execSync(command);
    if (result.exitCode) {
        console.warn(result.stderr);
        exit(result.exitCode);
    }
    fs.renameSync(`${DestDir}/${cmd}`, `${DestDir}/${destFileName}`);
})