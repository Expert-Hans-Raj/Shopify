document.addEventListener('DOMContentLoaded', function () {
  const quickViewOverlay = document.querySelector('.quick-view-overlay');
  const quickViewImage = document.querySelector('.quick-view-image img');
  const quickViewTitle = document.querySelector('.quick-view-title');
  const quickViewPrice = document.querySelector('.quick-view-price');
  const quickViewSwatches = document.getElementById('quick-view-variant-swatches');
  const addToCartBtn = document.querySelector('.quick-view-add-to-cart');
  let currentVariantId = null;

  // Mock function — replace with Shopify product JSON fetch by handle
  async function fetchProduct(handle) {
    const response = await fetch(`/products/${handle}.js`);
    return await response.json();
  }

  // Show Quick View
  document.querySelectorAll('.btn-quick-view').forEach(button => {
    button.addEventListener('click', async () => {
      const handle = button.dataset.productHandle;
      const product = await fetchProduct(handle);
      
      // Fill in details
      quickViewTitle.textContent = product.title;
      quickViewImage.src = product.featured_image;
      quickViewPrice.textContent = Shopify.formatMoney(product.variants[0].price, window.Shopify.money_format);
      currentVariantId = product.variants[0].id;

      // Create swatches
      quickViewSwatches.innerHTML = '';
      product.variants.forEach(variant => {
        const swatch = document.createElement('span');
        swatch.className = 'color-swatch';
        swatch.title = variant.title;
        swatch.dataset.image = variant.featured_image?.src || product.featured_image;
        swatch.dataset.price = variant.price;
        swatch.dataset.variantId = variant.id;

        // Try to extract color name or hex
        const colorName = variant.option1.toLowerCase();
        if (variant.featured_image && variant.featured_image.src.includes('.jpg') || variant.featured_image.src.includes('.png')) {
          swatch.style.backgroundImage = `url(${variant.featured_image.src})`;
        } else {
          swatch.style.backgroundColor = colorName;
        }

        if (currentVariantId === variant.id) swatch.classList.add('active');

        swatch.addEventListener('click', () => {
          document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
          swatch.classList.add('active');
          quickViewImage.src = swatch.dataset.image;
          quickViewPrice.textContent = Shopify.formatMoney(swatch.dataset.price, window.Shopify.money_format);
          currentVariantId = swatch.dataset.variantId;
        });

        quickViewSwatches.appendChild(swatch);
      });

      quickViewOverlay.style.display = 'flex';
    });
  });

  // Close Modal
  document.querySelector('.quick-view-close').addEventListener('click', () => {
    quickViewOverlay.style.display = 'none';
  });

  // Add to Cart
  addToCartBtn.addEventListener('click', () => {
    if (!currentVariantId) return;
    fetch('/cart/add.js', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ id: currentVariantId, quantity: 1 })
    })
    .then(res => res.json())
    .then(data => {
      alert(`${data.title} added to cart!`);
      quickViewOverlay.style.display = 'none';
    });
  });
});

