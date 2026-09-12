document.addEventListener("alpine:init", () => {
  // 1. Store Global khusus pencarian
  Alpine.store("search", {
    keyword: "",
  });

  // Data Produk
  Alpine.data("menus", () => ({
    items: [
      {
        id: 1,
        name: "Nasi Goreng",
        img: "img/nasi-goreng.jpg",
        price: 10000,
        desc: "Kalau bicara Nasi goreng lezat dengan campuran sayuran dan bumbu rempah pilihan khas rumahan Warung Sulistia tempatnya.",
      },
      {
        id: 2,
        name: "Pangsit Ayam Rebus/ Goreng",
        img: "img/pangsit-ayam.jpg",
        price: 15000,
        desc: "Pangsit ayam gurih yang disajikan dengan kuah hangat atau digoreng renyah.",
      },
      {
        id: 3,
        name: "Pisang Kembung",
        img: "img/pisang-kembung.jpg",
        price: 10000,
        desc: "Pisang goreng tepung yang krispi, empuk, manis, dan digoreng hingga merekah sempurna.",
      },
      {
        id: 4,
        name: "Piscok Lumer",
        img: "img/piscok-lumer.jpg",
        price: 15000,
        desc: "Pisang cokelat goreng berbalut kulit lumpia renyah dengan isian cokelat yang meleleh.",
      },
      {
        id: 5,
        name: "Tempura Chili Oil",
        img: "img/tempura-chili-oil.jpg",
        price: 15000,
        desc: "Tempura Chili Oil menggabungkan tempura goreng renyah dan lainnya. Kombinasi ini populer sebagai camilan, makanan jalanan, atau pembuka, menawarkan keseimbangan antara tekstur renyah dan rasa pedas serta gurih.",
      },
      {
        id: 6,
        name: "Pop Es",
        img: "img/pop-es.jpg",
        price: 5000,
        desc: "Minuman es blender segar dengan berbagai pilihan rasa buah dan toping menarik.",
      },
      {
        id: 7,
        name: "Capcin (Cappuccino Cincau)",
        img: "img/capcin.jpg",
        price: 5000,
        desc: "Perpaduan es cappuccino yang creamy dengan serutan cincau hitam yang kenyal dan segar.",
      },
      {
        id: 8,
        name: "Es Teh Jumbo",
        img: "img/es-teh-jumbo.jpg",
        price: 5000,
        desc: "Es teh manis tradisional yang disajikan dalam porsi gelas besar untuk melepas dahaga.",
      },
      {
        id: 9,
        name: "Es Marimas",
        img: "img/marimas.jpg",
        price: 5000,
        desc: "Minuman buah sachet instan yang menyegarkan, disajikan dingin di kala cuaca panas.",
      },
    ],

    // Getter untuk memfilter item berdasarkan kata kunci search di store
    get filteredItems() {
      const keyword = Alpine.store("search").keyword.toLowerCase();
      if (!keyword) {
        return this.items;
      }
      return this.items.filter((item) =>
        item.name.toLowerCase().includes(keyword),
      );
    },
  }));

  // Store Keranjang Belanja
  Alpine.store("cart", {
    items: [],
    total: 0,
    quantity: 0,

    add(newItem) {
      // Cek apakah barang sudah ada di keranjang
      const cartItem = this.items.find((item) => item.id === newItem.id);

      if (!cartItem) {
        this.items.push({ ...newItem, quantity: 1, total: newItem.price });
        this.quantity++;
        this.total += newItem.price;
      } else {
        // Jika barang sudah ada, tambah quantity & total item
        this.items = this.items.map((item) => {
          if (item.id !== newItem.id) {
            return item;
          } else {
            item.quantity++;
            item.total = item.price * item.quantity;
            this.quantity++;
            this.total += item.price;
            return item;
          }
        });
      }
    },

    remove(id) {
      const cartItem = this.items.find((item) => item.id === id);

      if (cartItem.quantity > 1) {
        // Kurangi quantity jika lebih dari 1
        this.items = this.items.map((item) => {
          if (item.id !== id) {
            return item;
          } else {
            item.quantity--;
            item.total = item.price * item.quantity;
            this.quantity--;
            this.total -= item.price;
            return item;
          }
        });
      } else if (cartItem.quantity === 1) {
        // Hapus item dari keranjang jika tinggal 1
        this.items = this.items.filter((item) => item.id !== id);
        this.quantity--;
        this.total -= cartItem.price;
      }
    },
    // 1. KITA TAMBAHKAN FUNGSI CLEAR DI SINI
    clear() {
      this.items = [];
      this.total = 0;
      this.quantity = 0;
    },
  });
});

// Modal Logic & Form Interaction
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.querySelector("#item-detail-modal");
  const modalImg = modal.querySelector(".modal-img");
  const modalTitle = modal.querySelector(".modal-title");
  const modalDesc = modal.querySelector(".modal-desc");
  const modalPrice = modal.querySelector(".modal-price");
  const closeBtn = document.querySelector("#close-modal-btn");
  const modalAddToCartBtn = document.querySelector("#modal-add-to-cart-btn"); // Selesai Diperbaiki di sini

  let currentModalItem = null;

  // Tangkap klik di seluruh halaman
  document.addEventListener("click", function (e) {
    const targetBtn = e.target.closest(".item-detail-button");

    if (targetBtn) {
      e.preventDefault();

      // 1. Ambil data dari atribut tombol yang diklik
      const id = targetBtn.getAttribute("data-id"); // Ambil ID asli agar sinkron dengan cart
      const name = targetBtn.getAttribute("data-name");
      const img = targetBtn.getAttribute("data-img");
      const price = targetBtn.getAttribute("data-price");
      const description = targetBtn.getAttribute("data-description");

      // 2. Masukkan data ke dalam elemen modal box
      modalTitle.textContent = name;
      modalImg.src = img;
      modalImg.alt = name;
      modalPrice.textContent = price;
      modalDesc.textContent = description;

      // Simpan data produk asli lengkap untuk keperluan Alpine Cart
      currentModalItem = {
        id: parseInt(id),
        name: name,
        img: img.replace("img/", ""),
        price: parseInt(price.replace(/[^0-9]/g, "")),
      };

      // 3. Tampilkan modal box
      modal.style.display = "flex";
    }
  });

  // AKTIFKAN TOMBOL KERANJANG DI MODAL
  if (modalAddToCartBtn) {
    modalAddToCartBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (currentModalItem && window.Alpine && Alpine.store("cart")) {
        Alpine.store("cart").add(currentModalItem);
        modal.style.display = "none"; // Tutup modal otomatis setelah ditambah
      }
    });
  }

  // Fungsi klik tombol close
  if (closeBtn) {
    closeBtn.addEventListener("click", function (e) {
      e.preventDefault();
      modal.style.display = "none";
    });
  }

  // Fungsi klik di luar area modal window
  window.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});

// Fungsi Kirim Data Form ke WhatsApp (Hanya Gunakan Satu Fungsi Ini)
window.kirimData = function (e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = new URLSearchParams(formData);
  const objData = Object.fromEntries(data);
  const message = formatMessage(objData);

  // 1. Membuka WhatsApp (Kode awal Anda yang berhasil)
  window.open(
    `https://wa.me/6282278987413?text=` + encodeURIComponent(message),
  );

  // 2. Memunculkan notifikasi sukses
  alert("🎉 Pesan telah berhasil terkirim! Terima kasih.");

  // 3. Mengosongkan formulir ketikan nama dan alamat
  e.target.reset();

  // 4. Mengosongkan keranjang belanja Alpine.js
  // Langkah ini otomatis akan menghilangkan form checkout secara instan tanpa mengunci sistem
  if (
    window.Alpine &&
    Alpine.store("cart") &&
    typeof Alpine.store("cart").clear === "function"
  ) {
    Alpine.store("cart").clear();
  }

  // 3. BARIS PERBAIKAN: Kosongkan isi input teks Nama & Alamat secara aman dari sisi JavaScript
  const formFormular = e.target;
  if (formFormular) {
    formFormular.reset(); // Mengosongkan kotak input fisik tanpa merusak struktur render Alpine
  }
};

const formatMessage = (obj) => {
  const listPesanan = JSON.parse(obj.items)
    .map((item) => {
      return `- ${item.name} (${item.quantity} x ${rupiah(item.total)})\n`;
    })
    .join("");

  return `Data Customer:
Nama   : ${obj.name}
Alamat : ${obj.address}

Data Pesanan:
${listPesanan}
Total: ${rupiah(obj.total)}

Terima Kasih.`;
};

// ini wa ayuk Sulistia (6282278987413)
// ini wa Bakso Naufal (6289530768006)

// Konversi Angka ke Format Rupiah
const rupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};
