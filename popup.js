 console.log("Popup script loaded.");

document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const splitButton = document.getElementById('splitButton');
    const fileNameSpan = document.getElementById('fileName');
    const statusMessage = document.getElementById('statusMessage');
    // Future elements (optional for now):
    // const progressBar = document.getElementById('progressBar');
    // const progressText = document.getElementById('progressText');
    // const downloadArea = document.getElementById('downloadArea');
    // const downloadLink = document.getElementById('downloadLink');

    let selectedFile = null;

    // --- File Input Handling ---
    fileInput.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            selectedFile = files[0];
            fileNameSpan.textContent = selectedFile.name;
            splitButton.disabled = false;
            statusMessage.textContent = ''; // Clear status
            console.log("File selected:", selectedFile.name);
            // Reset progress/download if needed
            // progressBar.value = 0;
            // progressText.textContent = '0%';
            // downloadArea.style.display = 'none';
        } else {
            selectedFile = null;
            fileNameSpan.textContent = 'No file chosen';
            splitButton.disabled = true;
            statusMessage.textContent = ''; // Clear status
            console.log("File selection cancelled.");
        }
    });

    // --- Split Button Handling ---
    splitButton.addEventListener('click', () => {
        if (!selectedFile) {
            statusMessage.textContent = 'Error: No file selected.';
            console.error('Split button clicked without a file selected.');
            return;
        }

        // Disable button during processing
        splitButton.disabled = true;
        statusMessage.textContent = 'Reading file...';
        console.log('Split button clicked. Reading file:', selectedFile.name);

        const reader = new FileReader();

        reader.onload = (event) => {
            console.log('File read successfully.');
            statusMessage.textContent = 'Parsing file...';
            try {
                const data = event.target.result;
                // Ensure SheetJS (XLSX) is loaded (it should be, via popup.html)
                if (typeof XLSX === 'undefined') {
                   throw new Error("SheetJS library (XLSX) not loaded.");
                }

                const workbook = XLSX.read(data, { type: 'array' });
                console.log('Workbook parsed.');

                // --- Basic Parsing Example: Get data from the first sheet ---
                const firstSheetName = workbook.SheetNames[0];
                if (!firstSheetName) {
                    throw new Error("No sheets found in the Excel file.");
                }
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // header: 1 gives array of arrays

                console.log(`Parsed data from sheet "${firstSheetName}":`, jsonData);
                statusMessage.textContent = `Successfully parsed sheet "${firstSheetName}". ${jsonData.length} rows found.`; // Example status

                // TODO: Implement the actual splitting logic here based on jsonData
                // This will likely involve iterating through jsonData, grouping by the first column,
                // creating new workbooks/sheets, and preparing them for download (e.g., using JSZip).

                // Re-enable button after successful parse (or move to after splitting/download prep)
                // splitButton.disabled = false; // Keep disabled until next step is ready

            } catch (error) {
                console.error('Error parsing Excel file:', error);
                statusMessage.textContent = `Error parsing file: ${error.message}`;
                // Re-enable button on error
                splitButton.disabled = false;
            }
        };

        reader.onerror = (event) => {
            console.error('Error reading file:', event.target.error);
            statusMessage.textContent = `Error reading file: ${event.target.error.name}`;
            // Re-enable button on error
            splitButton.disabled = false;
        };

        // Read the file as an ArrayBuffer, suitable for SheetJS
        reader.readAsArrayBuffer(selectedFile);
    });

    // --- Initial State ---
    splitButton.disabled = true; // Ensure button is disabled initially
    // downloadArea.style.display = 'none'; // Hide download area initially

    console.log("Popup script initialized.");
});