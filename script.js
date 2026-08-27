const quoteDate = document.getElementById("quoteDate");
const previewDate = document.getElementById("previewDate");

const quoteNumber = document.getElementById("quoteNumber");
const quoteNumberPreview = document.getElementById("quoteNumberPreview");

const clientFields = document.getElementById("clientFields");
const previewClientFields = document.getElementById("previewClientFields");

const quoteItems = document.getElementById("quoteItems");

const showGrandTotal = document.getElementById("showGrandTotal");
const grandTotalSection = document.getElementById("grandTotalSection");

const grandTotalGST = document.getElementById("grandTotalGST");
const grandGSTCalculation = document.getElementById("grandGSTCalculation");

const grandTotalOptions = document.getElementById("grandTotalOptions");

const subtotalValue = document.getElementById("subtotalValue");
const grandGSTValue = document.getElementById("grandGSTValue");
const grandTotalValue = document.getElementById("grandTotalValue");

const grandGSTRow = document.getElementById("grandGSTRow");

const watermarkToggle = document.getElementById("watermarkToggle");
const watermarkText = document.getElementById("watermarkText");
const quoteWatermark = document.getElementById("quoteWatermark");


/* =========================
   DEFAULT DATE
========================= */

function setTodayDate() {

    const today = new Date();

    const yyyy = today.getFullYear();

    const mm = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const dd = String(
        today.getDate()
    ).padStart(2, "0");

    quoteDate.value =
        `${yyyy}-${mm}-${dd}`;

    updateDate();

}

setTodayDate();


/* =========================
   DATE FORMAT
========================= */

function updateDate() {

    if (!quoteDate.value) {

        previewDate.textContent = "";

        return;

    }

    const date = new Date(
        quoteDate.value + "T00:00:00"
    );

    previewDate.textContent =
        date.toLocaleDateString(
            "en-AU",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

}

quoteDate.addEventListener(
    "change",
    updateDate
);


/* =========================
   QUOTE NUMBER
========================= */

quoteNumber.addEventListener(
    "input",
    function () {

        if (this.value.trim()) {

            quoteNumberPreview.textContent =
                "Quote No : " + this.value;

        } else {

            quoteNumberPreview.textContent = "";

        }

    }
);


/* =========================
   CLIENT FIELDS
========================= */

function updateClientPreview() {

    previewClientFields.innerHTML = "";

    const fields =
        clientFields.querySelectorAll(
            ".client-field"
        );

    fields.forEach(field => {

        const label =
            field.querySelector(
                ".client-label"
            ).value;

        const value =
            field.querySelector(
                ".client-value"
            ).value;

        if (
            label.trim() ||
            value.trim()
        ) {

            const row =
                document.createElement("div");

            row.className =
                "preview-client-row";

            row.innerHTML = `
                <span class="preview-client-label">
                    ${escapeHtml(label)} :
                </span>

                <span class="preview-client-value">
                    ${escapeHtml(value)}
                </span>
            `;

            previewClientFields.appendChild(
                row
            );

        }

    });

}


clientFields.addEventListener(
    "input",
    updateClientPreview
);


/* =========================
   ADD CLIENT FIELD
========================= */

document
    .getElementById("addClientField")
    .addEventListener(
        "click",
        function () {

            const div =
                document.createElement("div");

            div.className =
                "client-field";

            div.innerHTML = `

                <input
                    type="text"
                    class="client-label"
                    placeholder="Field name"
                >

                <input
                    type="text"
                    class="client-value"
                    placeholder="Enter value"
                >

            `;

            clientFields.appendChild(div);

        }
    );


/* =========================
   ADD ITEM
========================= */

function addItem(
    data = {}
) {

    const row =
        document.createElement("tr");

    row.className =
        "quote-item-row";

    row.innerHTML = `

        <td class="description-cell">

            <input
                type="text"
                class="item-input item-description"
                placeholder="Description"
                value="${data.description || ""}"
            >

            <input
                type="text"
                class="item-input item-subdescription"
                placeholder="Small note (optional)"
                value="${data.note || ""}"
            >

        </td>


        <td>

            <input
                type="text"
                class="item-input item-unit"
                placeholder="m / Gate / Step"
                value="${data.unit || ""}"
            >

        </td>


        <td>

            <input
                type="number"
                class="item-input item-price"
                placeholder="0"
                value="${data.price || ""}"
            >

        </td>


        <td>

            <input
                type="number"
                class="item-input item-quantity"
                placeholder="0"
                value="${data.quantity || ""}"
            >

        </td>


        <td>

            <div
                class="item-total"
            >
                $0.00
            </div>


            <div
                class="item-gst-control editor-only"
            >

                <label
                    class="item-gst-label"
                >

                    <input
                        type="checkbox"
                        class="item-gst-toggle"
                    >

                    + GST

                </label>


                <label
                    class="item-gst-label item-gst-nested"
                >

                    <input
                        type="checkbox"
                        class="item-gst-calc"
                    >

                    Add 10%

                </label>

            </div>

        </td>


        <td class="editor-only">

            <button
                type="button"
                class="delete-item"
            >
                ×
            </button>

        </td>

    `;

    quoteItems.appendChild(row);

    const gstToggle =
        row.querySelector(
            ".item-gst-toggle"
        );

    const gstCalc =
        row.querySelector(
            ".item-gst-calc"
        );

    const nested =
        row.querySelector(
            ".item-gst-nested"
        );


    if (data.gst) {

        gstToggle.checked = true;

        nested.style.display =
            "flex";

    }


    if (data.gstCalc) {

        gstCalc.checked = true;

    }


    row.querySelectorAll("input")
        .forEach(input => {

            input.addEventListener(
                "input",
                updateAllTotals
            );

            input.addEventListener(
                "change",
                updateAllTotals
            );

        });


    gstToggle.addEventListener(
        "change",
        function () {

            nested.style.display =
                this.checked
                    ? "flex"
                    : "none";

            if (!this.checked) {

                gstCalc.checked = false;

            }

            updateAllTotals();

        }
    );


    row.querySelector(".delete-item")
        .addEventListener(
            "click",
            function () {

                row.remove();

                updateAllTotals();

            }
        );


    updateAllTotals();

}


/* =========================
   ITEM CALCULATION
========================= */

function getItemTotal(row) {

    const price =
        parseFloat(
            row.querySelector(
                ".item-price"
            ).value
        ) || 0;

    const quantity =
        parseFloat(
            row.querySelector(
                ".item-quantity"
            ).value
        ) || 0;

    let total =
        price * quantity;

    const gstToggle =
        row.querySelector(
            ".item-gst-toggle"
        );

    const gstCalc =
        row.querySelector(
            ".item-gst-calc"
        );

    if (
        gstToggle.checked &&
        gstCalc.checked
    ) {

        total =
            total * 1.10;

    }

    return total;

}


/* =========================
   UPDATE TOTALS
========================= */

function updateAllTotals() {

    let subtotal = 0;

    const rows =
        document.querySelectorAll(
            ".quote-item-row"
        );

    rows.forEach(row => {

        const total =
            getItemTotal(row);

        subtotal += total;

        const itemTotal =
            row.querySelector(
                ".item-total"
            );

        const gstToggle =
            row.querySelector(
                ".item-gst-toggle"
            );

        const gstCalc =
            row.querySelector(
                ".item-gst-calc"
            );

        let text =
            "$" +
            formatNumber(total);

        if (
            gstToggle.checked &&
            !gstCalc.checked
        ) {

            text += " + GST";

        }

        itemTotal.textContent =
            text;

    });


    subtotalValue.textContent =
        "$" + formatNumber(subtotal);


    let gstAmount = 0;

    let finalTotal =
        subtotal;


    if (
        grandTotalGST.checked &&
        grandGSTCalculation.checked
    ) {

        gstAmount =
            subtotal * 0.10;

        finalTotal =
            subtotal + gstAmount;

    }


    if (
        grandTotalGST.checked
    ) {

        grandGSTRow.style.display =
            "flex";

        grandGSTValue.textContent =
            grandGSTCalculation.checked
                ? "$" + formatNumber(gstAmount)
                : "+ GST";

    } else {

        grandGSTRow.style.display =
            "none";

    }


    grandTotalValue.textContent =
        "$" + formatNumber(finalTotal);

}


function formatNumber(number) {

    return number.toLocaleString(
        "en-AU",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


/* =========================
   ADD ITEM BUTTON
========================= */

document
    .getElementById("addItemBtn")
    .addEventListener(
        "click",
        function () {

            addItem();

        }
    );


/* =========================
   GRAND TOTAL OPTIONS
========================= */

showGrandTotal.addEventListener(
    "change",
    function () {

        grandTotalSection.style.display =
            this.checked
                ? "flex"
                : "none";

        grandTotalOptions.style.display =
            this.checked
                ? "block"
                : "none";

    }
);


grandTotalGST.addEventListener(
    "change",
    updateAllTotals
);


grandGSTCalculation.addEventListener(
    "change",
    updateAllTotals
);


/* =========================
   WATERMARK
========================= */

watermarkToggle.addEventListener(
    "change",
    function () {

        quoteWatermark.style.display =
            this.checked
                ? "block"
                : "none";

    }
);


watermarkText.addEventListener(
    "input",
    function () {

        quoteWatermark.textContent =
            this.value || "TM ELEVEN";

    }
);


document
    .getElementById("watermarkBtn")
    .addEventListener(
        "click",
        function () {

            watermarkToggle.checked =
                !watermarkToggle.checked;

            quoteWatermark.style.display =
                watermarkToggle.checked
                    ? "block"
                    : "none";

        }
    );


/* =========================
   SAVE DRAFT
========================= */

document
    .getElementById("saveDraftBtn")
    .addEventListener(
        "click",
        saveDraft
    );


function saveDraft() {

    const clientData = [];

    document
        .querySelectorAll(".client-field")
        .forEach(field => {

            clientData.push({

                label:
                    field.querySelector(
                        ".client-label"
                    ).value,

                value:
                    field.querySelector(
                        ".client-value"
                    ).value

            });

        });


    const itemData = [];

    document
        .querySelectorAll(".quote-item-row")
        .forEach(row => {

            itemData.push({

                description:
                    row.querySelector(
                        ".item-description"
                    ).value,

                note:
                    row.querySelector(
                        ".item-subdescription"
                    ).value,

                unit:
                    row.querySelector(
                        ".item-unit"
                    ).value,

                price:
                    row.querySelector(
                        ".item-price"
                    ).value,

                quantity:
                    row.querySelector(
                        ".item-quantity"
                    ).value,

                gst:
                    row.querySelector(
                        ".item-gst-toggle"
                    ).checked,

                gstCalc:
                    row.querySelector(
                        ".item-gst-calc"
                    ).checked

            });

        });


    const data = {

        date:
            quoteDate.value,

        quoteNumber:
            quoteNumber.value,

        clients:
            clientData,

        items:
            itemData,

        showGrandTotal:
            showGrandTotal.checked,

        grandTotalGST:
            grandTotalGST.checked,

        grandGSTCalculation:
            grandGSTCalculation.checked,

        watermark:
            watermarkToggle.checked,

        watermarkText:
            watermarkText.value

    };


    localStorage.setItem(
        "tm11QuoteDraft",
        JSON.stringify(data)
    );


    alert(
        "Draft saved successfully!"
    );

}


/* =========================
   LOAD DRAFT
========================= */

function loadDraft() {

    const saved =
        localStorage.getItem(
            "tm11QuoteDraft"
        );

    if (!saved) {

        return;

    }

    const data =
        JSON.parse(saved);


    if (data.date) {

        quoteDate.value =
            data.date;

        updateDate();

    }


    quoteNumber.value =
        data.quoteNumber || "";

    quoteNumber.dispatchEvent(
        new Event("input")
    );


    clientFields.innerHTML = "";

    data.clients.forEach(item => {

        const div =
            document.createElement("div");

        div.className =
            "client-field";

        div.innerHTML = `

            <input
                type="text"
                class="client-label"
                value="${escapeAttribute(item.label)}"
            >

            <input
                type="text"
                class="client-value"
                value="${escapeAttribute(item.value)}"
            >

        `;

        clientFields.appendChild(div);

    });


    quoteItems.innerHTML = "";

    data.items.forEach(item => {

        addItem(item);

    });


    showGrandTotal.checked =
        data.showGrandTotal;

    grandTotalSection.style.display =
        data.showGrandTotal
            ? "flex"
            : "none";

    grandTotalOptions.style.display =
        data.showGrandTotal
            ? "block"
            : "none";


    grandTotalGST.checked =
        data.grandTotalGST;

    grandGSTCalculation.checked =
        data.grandGSTCalculation;


    watermarkToggle.checked =
        data.watermark;

    watermarkText.value =
        data.watermarkText || "TM ELEVEN";

    quoteWatermark.textContent =
        watermarkText.value;

    quoteWatermark.style.display =
        data.watermark
            ? "block"
            : "none";


    updateClientPreview();

    updateAllTotals();

}


/* =========================
   PDF
========================= */

document
    .getElementById("downloadPdfBtn")
    .addEventListener(
        "click",
        function () {

            const quote =
                document.getElementById(
                    "quotePaper"
                );

            const editorElements =
                quote.querySelectorAll(
                    ".editor-only"
                );


            editorElements.forEach(el => {

                el.style.display =
                    "none";

            });


            const fileName =
                quoteNumber.value
                    ? `TM11-Quote-${quoteNumber.value}.pdf`
                    : "TM11-Quote.pdf";


            html2pdf()
                .set({

                    margin: 0,

                    filename:
                        fileName,

                    image: {

                        type: "jpeg",

                        quality: 0.98

                    },

                    html2canvas: {

                        scale: 2,

                        useCORS: true

                    },

                    jsPDF: {

                        unit: "mm",

                        format: "a4",

                        orientation: "portrait"

                    }

                })
                .from(quote)
                .save()
                .then(() => {

                    editorElements.forEach(el => {

                        el.style.display = "";

                    });

                });

        }
    );


/* =========================
   ESCAPE
========================= */

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text || "";

    return div.innerHTML;

}


function escapeAttribute(text) {

    return String(text || "")
        .replace(/"/g, "&quot;");

}


/* =========================
   INITIAL DATA
========================= */

addItem({
    description: "Fencing",
    note: "Extra charges will be applied for extra strips",
    unit: "1m",
    price: 120,
    quantity: 160,
    gst: true,
    gstCalc: false
});


addItem({
    description: "Gates",
    note: "With standard lock",
    unit: "One Gate",
    price: 750,
    quantity: 8,
    gst: true,
    gstCalc: false
});


addItem({
    description: "Decking",
    note: "Including materials",
    unit: "One Step",
    price: 3500,
    quantity: 5,
    gst: true,
    gstCalc: false
});


updateClientPreview();

updateAllTotals();

loadDraft();
