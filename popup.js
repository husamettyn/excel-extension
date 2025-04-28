console.log("Popup script loaded.");

// Dynamically load SheetJS if not already present
function loadLibrary(src, globalVarName, callback, errorCallback) {
    if (window[globalVarName]) {
        callback();
        return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
        console.log(`${globalVarName} loaded from ${src}`);
        callback();
    };
    script.onerror = () => {
        console.error(`Failed to load ${globalVarName} from ${src}`);
        if (errorCallback) errorCallback(new Error(`${globalVarName} failed to load`));
    };
    document.head.appendChild(script);
}

function initExtension() {
    const fileInput = document.getElementById('fileInput');
    const splitButton = document.getElementById('splitButton');
    const fileNameSpan = document.getElementById('fileName');
    const statusMessage = document.getElementById('statusMessage');
    const progressArea = document.getElementById('progressArea');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const downloadArea = document.getElementById('downloadArea');
    const downloadLink = document.getElementById('downloadLink');

    let selectedFile = null;

    fileInput.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            selectedFile = files[0];
            fileNameSpan.textContent = selectedFile.name;
            splitButton.disabled = false;
            statusMessage.textContent = '';
            progressArea.style.display = 'none';
            downloadArea.style.display = 'none';
        } else {
            selectedFile = null;
            fileNameSpan.textContent = 'No file chosen';
            splitButton.disabled = true;
            statusMessage.textContent = '';
        }
    });

    splitButton.addEventListener('click', () => {
        if (!selectedFile) {
            statusMessage.textContent = 'Error: No file selected.';
            console.error('Split button clicked without a file selected.');
            return;
        }
        if (typeof JSZip === 'undefined') {
            statusMessage.textContent = 'Error: JSZip library not loaded.';
            console.error('JSZip not loaded.');
            splitButton.disabled = false;
            return;
        }

        splitButton.disabled = true;
        statusMessage.textContent = 'Reading file...';
        progressArea.style.display = 'none';
        downloadArea.style.display = 'none';

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                statusMessage.textContent = 'Parsing file...';
                const data = event.target.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                if (!firstSheetName) throw new Error('No sheets found in the Excel file.');
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                statusMessage.textContent = `Parsed sheet "${firstSheetName}". Preparing split...`;

                const header = jsonData[0] || [];
                const rows = jsonData.slice(1);
                const groups = {};
                rows.forEach(row => {
                    const key = row[0] != null ? String(row[0]) : 'undefined';
                    if (!groups[key]) groups[key] = [];
                    groups[key].push(row);
                });
                const keys = Object.keys(groups);
                if (keys.length === 0) {
                    statusMessage.textContent = 'No data rows to split.';
                    splitButton.disabled = false;
                    return;
                }

                const zip = new JSZip();
                progressArea.style.display = 'flex';
                progressBar.max = keys.length;
                progressBar.value = 0;
                progressText.textContent = `0/${keys.length}`;

                keys.forEach((key, index) => {
                    const wb = XLSX.utils.book_new();
                    const wsData = [header, ...groups[key]];
                    const ws = XLSX.utils.aoa_to_sheet(wsData);
                    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
                    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                    zip.file(`${key}.xlsx`, wbout);
                    progressBar.value = index + 1;
                    progressText.textContent = `${index + 1}/${keys.length}`;
                });

                zip.generateAsync({ type: 'blob' }).then(blob => {
                    const url = URL.createObjectURL(blob);
                    downloadLink.href = url;
                    downloadLink.download = 'split_files.zip';
                    downloadArea.style.display = 'block';
                    statusMessage.textContent = 'Split complete! Download below.';
                    statusMessage.classList.add('success');
                }).catch(err => {
                    console.error('Error generating zip:', err);
                    statusMessage.textContent = `Error generating zip: ${err.message}`;
                    splitButton.disabled = false;
                });

            } catch (error) {
                console.error('Error processing file:', error);
                statusMessage.textContent = `Error: ${error.message}`;
                splitButton.disabled = false;
            }
        };
        reader.onerror = (e) => {
            console.error('Error reading file:', e);
            statusMessage.textContent = `Error reading file: ${e.target.error.name}`;
            splitButton.disabled = false;
        };
        reader.readAsArrayBuffer(selectedFile);
    });

    splitButton.disabled = true;
    progressArea.style.display = 'none';
    downloadArea.style.display = 'none';
    console.log('Extension initialized after SheetJS load.');
}

// On DOMContentLoaded, ensure SheetJS is loaded, then initialize
document.addEventListener('DOMContentLoaded', function() {
    loadLibrary('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js', 'XLSX', initExtension, (err) => {
        const statusMessage = document.getElementById('statusMessage');
        if (statusMessage) statusMessage.textContent = 'Error loading SheetJS library.';
    });
});
