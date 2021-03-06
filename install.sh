# MIT License

# Copyright (c) 2021 Yakov Borevich, Funexpected LLC

# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

TMPDIR=`mktemp -d`
cd $TMPDIR
curl -# -L https://github.com/funexpected/flash-tools/releases/latest/download/funexpected-tools.zip -o funexpected-tools.zip
unzip -qq funexpected-tools.zip
cd funexpected-tools/
chmod a+x "Funexpected Tools/toolkit"
ls -d $HOME/Library/Application\ Support/Adobe/Animate*/*/Configuration/Commands/ | xargs -I{} cp -R ./* "{}"
ls -d $HOME/Library/Application\ Support/Adobe/Animate*/*/Configuration/Commands/Funexpected\ Tools/toolkit | xargs -I{} chmod a+x "{}" 
echo "Funexpected Flash Tools installed. Restart Adobe Animate and inspect 'Commands/Funexpected Tools' menu."