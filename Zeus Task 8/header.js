export default function createExcelHeader(container, Grid) {
    const header = document.createElement('header');
    header.className = 'excel-header';
    header.innerHTML = `
        <div class="header-title">Excel UI</div>
        <div class="header-actions">
            <button id="undo-btn">Undo</button>
            <button id="redo-btn">Redo</button>
            <button id="upload-btn">Upload</button>
        </div>
    `;

    let grid = null;
    
    async function loadDefaultData() {
        const res = await fetch('data.json');
        const data = await res.json();
        grid = new Grid(container, data); // Ye constuctor call ne vo sare canvas create and inject into container kiye
    }

    async function handleUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.style.display = 'none';
        document.body.appendChild(input);
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const text = await file.text();
            try {
                const jsonData = JSON.parse(text);
                container.innerHTML = '';
                grid = new Grid(container, jsonData);
            } catch (error) {
                alert(`Invalid JSON file: ${error.message}`);
            }
            document.body.removeChild(input);
        });
        input.click();
    }

    header.querySelector('#upload-btn').addEventListener('click', handleUpload);

    // Load default data on header creation
    loadDefaultData();

    return header;
}