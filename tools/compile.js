const fs = require('fs');
const { execSync } = require('child_process');
const { exit } = require('process');

const SrcDir = 'out/tsc'
const DestDir = 'out/compiled'

if (fs.existsSync(DestDir)) fs.rmdirSync(DestDir, { recursive: true });
fs.readdirSync(SrcDir + '/commands').forEach(cmd => {
    let command = `npx google-closure-compiler --js=${SrcDir}/lib/** --js=${SrcDir}/commands/${cmd} --language_out ECMASCRIPT3 --js_output_file=${DestDir}/${cmd} --force_inject_library=es6_runtime --module_resolution=node --process_common_js_modules=true`
    console.log(`comiling ${cmd}`)
    let result = execSync(command);
    if (result.exitCode) {
        console.warn(result.stderr);
        exit(result.exitCode);
    }
})