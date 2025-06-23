document.addEventListener('DOMContentLoaded', function () {
  const metalSpan = document.getElementById('selected-metal');
  const variantSelector = document.querySelector('[name="id"]');
  const productJson = document.getElementById('ProductJson-{{ product.id }}');
  const metafieldsJson = document.getElementById('MetafieldsJson');
  const priceTableBody = document.getElementById('price-table-body');
  const weightDetails = document.getElementById('weight-details');

  if (!productJson || !metafieldsJson || !priceTableBody || !weightDetails) return;

  const productData = JSON.parse(productJson.textContent);
  const metafields = JSON.parse(metafieldsJson.textContent);
  const metalOptionIndex = productData.options.findIndex(option => option.toLowerCase() === 'metal');

  function updateDisplay() {
    const selectedVariantId = variantSelector.value;
    const selectedVariant = productData.variants.find(variant => variant.id == selectedVariantId);
    
    let selectedMetal = 'N/A';
    if (selectedVariant && metalOptionIndex !== -1) {
      selectedMetal = selectedVariant.options[metalOptionIndex] || 'N/A';
      metalSpan.innerText = selectedMetal;
    }

    // Determine metal key (14kt or 18kt)
    const metalKey = selectedMetal.includes('14Kt') ? '14kt' : '18kt';

    // Domain check
    const hostname = window.location.hostname;
    const useInr = hostname.endsWith(".in");
    const currency = useInr ? "₹" : "$";
    const taxLabel = useInr ? "GST" : "Tax";

    // Select metafields based on metal and region
    const data = metafields[metalKey][useInr ? 'india' : 'usa'];
    const weights = metafields[metalKey];

    // Update weight details
    weightDetails.innerHTML = `
      Gross (Product): ${weights.gross_product || 'N/A'} Gram<br>
      Net (Gold): ${weights.net_gold || 'N/A'} Gram
    `;

    // Update price table
    priceTableBody.innerHTML = `
      <tr><td>Gold</td><td>${currency} ${data.gold || '0'}</td></tr>
      <tr><td>Diamond</td><td>${currency} ${data.diamond || '0'}</td></tr>
      <tr><td>Making Charge</td><td>${currency} ${data.making_charge || '0'}</td></tr>
      <tr><td>${taxLabel}</td><td>${currency} ${data[taxLabel.toLowerCase()] || '0'}</td></tr>
      <tr><th>Total</th><th>${currency} ${data.total || '0'}</th></tr>
    `;
  }

  // Initial update
  if (variantSelector) {
    updateDisplay();
    
    // Listen for changes on the hidden variant selector
    variantSelector.addEventListener('change', updateDisplay);
  }

  // Listen for variant changes from variant picker components
  document.addEventListener('variant:change', function(event) {
    if (event.detail && event.detail.variant) {
      // Update the hidden input value
      if (variantSelector) {
        variantSelector.value = event.detail.variant.id;
      }
      updateDisplay();
    }
  });

  // Listen for changes on variant radio buttons (if using button picker)
  const variantRadios = document.querySelectorAll('input[name^="options["]');
  variantRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      // Small delay to ensure variant selector is updated
      setTimeout(updateDisplay, 100);
    });
  });

  // Listen for changes on variant select dropdowns (if using dropdown picker)
  const variantSelects = document.querySelectorAll('select[name^="options["]');
  variantSelects.forEach(select => {
    select.addEventListener('change', function() {
      // Small delay to ensure variant selector is updated
      setTimeout(updateDisplay, 100);
    });
  });

  // Use MutationObserver to watch for changes in the hidden variant input
  if (variantSelector) {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
          updateDisplay();
        }
      });
    });

    observer.observe(variantSelector, {
      attributes: true,
      attributeFilter: ['value']
    });

    // Also watch for value changes via property
    let lastValue = variantSelector.value;
    setInterval(function() {
      if (variantSelector.value !== lastValue) {
        lastValue = variantSelector.value;
        updateDisplay();
      }
    }, 500);
  }
});
