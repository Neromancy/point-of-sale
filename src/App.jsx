import { useState, useMemo, useEffect } from 'react';
import {
  Container, Row, Col, Card, Form, Button, Table,
  Toast, ToastContainer, Badge
} from 'react-bootstrap';

export default function App() {
  // Opsi untuk dropdown kategori
  const categoryOptions = ['Elektronik', 'Pakaian', 'Makanan', 'Minuman', 'Lainnya'];

  // Data awal produk jika localStorage kosong
  const initialProducts = useMemo(() => ([
    {
      id: 1, name: 'Laptop Gaming ASUS ROG', description: 'Laptop spek dewa untuk gaming dan desain grafis. RAM 16GB, SSD 1TB.',
      price: 15000000, category: 'Elektronik', releaseDate: '2023-01-15', stock: 25, isActive: true
    },
    {
      id: 2, name: 'Kemeja Flanel', description: 'Kemeja flanel unisex bahan katun premium, nyaman dipakai sehari-hari.',
      price: 250000, category: 'Pakaian', releaseDate: '2023-03-20', stock: 150, isActive: true
    },
    {
      id: 3, name: 'Kopi Arabika Gayo', description: 'Biji kopi arabika asli dari dataran tinggi Gayo, Aceh. Kemasan 250gr.',
      price: 85000, category: 'Minuman', releaseDate: '2022-11-01', stock: 80, isActive: false
    },
  ]), []);

  // State utama untuk menyimpan daftar produk, mengambil dari localStorage jika ada
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem('products');
    try {
      return savedProducts ? JSON.parse(savedProducts) : initialProducts;
    } catch (error) {
      return initialProducts;
    }
  });

  // State untuk mengelola nilai-nilai dari form input
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [stock, setStock] = useState(50);
  const [isActive, setIsActive] = useState(true);

  // State untuk fungsionalitas aplikasi (UI/UX)
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  // Fungsi untuk menyimpan data ke localStorage setiap kali state 'products' berubah
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  // Fungsi untuk memvalidasi semua input form sebelum submit
  const validate = () => {
    const newErrors = {};
    const today = new Date().setHours(0, 0, 0, 0);

    if (!name.trim()) newErrors.name = 'Nama Produk wajib diisi.';
    else if (name.trim().length > 100) newErrors.name = 'Nama Produk maksimal 100 karakter.';
    else {
        const isDuplicate = products.some(p => p.name.toLowerCase() === name.trim().toLowerCase() && p.id !== editingId);
        if (isDuplicate) newErrors.name = 'Nama Produk sudah ada.';
    }
    if (description.trim().length < 20) newErrors.description = 'Deskripsi minimal 20 karakter.';
    if (!price || price <= 0) newErrors.price = 'Harga wajib diisi dan harus lebih dari 0.';
    if (!category) newErrors.category = 'Kategori wajib dipilih.';
    if (!releaseDate) newErrors.releaseDate = 'Tanggal rilis wajib diisi.';
    else if (new Date(releaseDate).setHours(0, 0, 0, 0) > today) {
        newErrors.releaseDate = 'Tanggal rilis tidak boleh di masa depan.';
    }
    if (stock < 0) newErrors.stock = 'Stok tidak boleh kurang dari 0.';

    return newErrors;
  };

  // Fungsi untuk mengembalikan semua field form ke nilai awal
  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice(0);
    setCategory('');
    setReleaseDate('');
    setStock(50);
    setIsActive(true);
    setErrors({});
    setEditingId(null);
  };
  
  // Fungsi yang menangani logika saat form di-submit (Create & Update)
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToastMsg('Periksa kembali input Anda.', 'danger');
      return;
    }

    const productData = {
        name: name.trim(), description: description.trim(),
        price: Number(price), category, releaseDate,
        stock: Number(stock), isActive
    };

    if (editingId === null) {
      setProducts([{ id: Date.now(), ...productData }, ...products]);
      showToastMsg('Produk berhasil ditambahkan.', 'success');
    } else {
      setProducts(products.map(p => p.id === editingId ? { id: editingId, ...productData } : p));
      showToastMsg('Produk berhasil diperbarui.', 'success');
    }
    resetForm();
  };

  // Fungsi untuk mengisi form dengan data produk yang akan diedit
  const handleEdit = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setCategory(product.category);
    setReleaseDate(product.releaseDate);
    setStock(product.stock);
    setIsActive(product.isActive);
    setErrors({});
  };

  // Fungsi utilitas untuk menampilkan notifikasi toast
  const showToastMsg = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  // Fungsi untuk menghapus produk dari daftar
  const handleDelete = (id) => {
    const target = products.find(p => p.id === id);
    if (!target) return;
    if (window.confirm(`Apakah Anda yakin ingin menghapus produk "${target.name}"?`)) {
      setProducts(products.filter(p => p.id !== id));
      if (editingId === id) resetForm();
      showToastMsg('Produk berhasil dihapus.', 'success');
    }
  };

  // Variabel bantu untuk menentukan mode edit
  const isEditing = editingId !== null;

  return (
    <Container className="py-4">
      <Row>
        {/* Bagian UI: Form untuk input data produk */}
        <Col lg={5}>
          <Card className="mb-4">
            <Card.Header as="h5">{isEditing ? 'Edit Produk' : 'Tambah Produk'}</Card.Header>
            <Card.Body>
              <Form noValidate onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Nama Produk</Form.Label>
                  <Form.Control type="text" value={name} onChange={e => setName(e.target.value)} isInvalid={!!errors.name} maxLength={100} />
                  <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Deskripsi</Form.Label>
                  <Form.Control as="textarea" rows={3} value={description} onChange={e => setDescription(e.target.value)} isInvalid={!!errors.description} />
                   <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                </Form.Group>
                
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Harga</Form.Label>
                            <Form.Control type="number" value={price} onChange={e => setPrice(e.target.value)} isInvalid={!!errors.price} />
                            <Form.Control.Feedback type="invalid">{errors.price}</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Kategori</Form.Label>
                            <Form.Select value={category} onChange={e => setCategory(e.target.value)} isInvalid={!!errors.category}>
                                <option value="">Pilih Kategori...</option>
                                {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>
                
                <Form.Group className="mb-3">
                    <Form.Label>Tanggal Rilis</Form.Label>
                    <Form.Control type="date" value={releaseDate} onChange={e => setReleaseDate(e.target.value)} isInvalid={!!errors.releaseDate} />
                    <Form.Control.Feedback type="invalid">{errors.releaseDate}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Stok Tersedia: {stock}</Form.Label>
                    <Form.Range min="0" max="500" value={stock} onChange={e => setStock(e.target.value)} isInvalid={!!errors.stock}/>
                    <Form.Control.Feedback type="invalid">{errors.stock}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Check type="switch" label="Produk Aktif" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button type="submit" variant={isEditing ? 'primary' : 'success'}>
                    {isEditing ? 'Simpan Perubahan' : 'Tambah Produk'}
                  </Button>
                  {isEditing && (<Button type="button" variant="secondary" onClick={resetForm}>Batal</Button>)}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Bagian UI: Tabel untuk menampilkan daftar produk */}
        <Col lg={7}>
          <Card>
            <Card.Header as="h5">Daftar Produk ({products.length})</Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nama Produk</th>
                    <th>Harga</th>
                    <th>Kategori</th>
                    <th>Tgl. Rilis</th>
                    <th className="text-center">Stok</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan="8" className="text-center py-3">Belum ada data produk.</td></tr>
                  ) : (
                    products.map((product, idx) => (
                      <tr key={product.id}>
                        <td>{idx + 1}</td>
                        <td>
                          {product.name}
                          <div className="text-muted small" style={{whiteSpace: 'pre-wrap'}}>{product.description}</div>
                        </td>
                        <td>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price)}</td>
                        <td>{product.category}</td>
                        <td>{new Date(product.releaseDate).toLocaleDateString('id-ID')}</td>
                        <td className="text-center">{product.stock}</td>
                        <td className="text-center">
                          <Badge bg={product.isActive ? 'success' : 'secondary'}>
                            {product.isActive ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <Button size="sm" variant="warning" className="me-2" onClick={() => handleEdit(product)}>Edit</Button>
                          <Button size="sm" variant="danger" onClick={() => handleDelete(product.id)}>Hapus</Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bagian UI: Notifikasi Toast */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Header closeButton><strong className="me-auto">Notifikasi</strong></Toast.Header>
          <Toast.Body className={toastVariant === 'danger' ? 'text-white' : ''}>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}