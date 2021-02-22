const fs = require('fs');
const { exec } = require('child_process');

const SrcDir = 'out/tsc'
const DestDir = 'out/compiled'

if (fs.existsSync(DestDir)) fs.rmdirSync(DestDir, { recursive: true });
fs.readdirSync(SrcDir + '/commands').forEach(cmd => {
    console.log(`comiling ${cmd}`)
    exec(`npx google-closure-compiler --js=${SrcDir}/lib/* --js=${SrcDir}/commands/${cmd} --language_out ECMASCRIPT3 --js_output_file=${DestDir}/${cmd} --force_inject_library=es6_runtime --module_resolution=node --process_common_js_modules=true`)
})