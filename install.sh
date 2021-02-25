TMPDIR=`mktemp -d`
cd $TMPDIR
curl -# -L https://github.com/funexpected/flash-tools/releases/latest/download/funexpected-tools.zip -o funexpected-tools.zip
unzip -qq funexpected-tools.zip
cd funexpected-tools/
ls -d $HOME/Library/Application\ Support/Adobe/Animate*/*/Configuration/Commands/ | xargs -I{} cp -R ./* "{}"
echo "Funexpected Flash Tools installed. Restart Adobe Animate and inspect 'Commands/Funexpected Tools' menu."