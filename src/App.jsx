import { useState, useMemo, useEffect } from 'react';
import {
  Container, Row, Col, Card, Form, Button, Table,
  Toast, ToastContainer
} from 'react-bootstrap';

export default function App() {
  // Data awal produk
  const initialProducts = useMemo(() => ([
    { id: 1, name: 'Makanan', description: 'Produk makanan siap saji' },
    { id: 2, name: 'Minuman', description: 'Aneka minuman dingin & hangat' },
  ]), []);

  // State untuk daftar produk, data form, error, dan notifikasi toast
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem('products');
    return savedProducts ? JSON.parse(savedProducts) : initialProducts;
  });
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null); // null berarti mode 'tambah', selain itu mode 'edit'

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  

  // Fungsi untuk validasi input form
  const validate = () => {
    const newErrors = {};
    const trimmedName = name.trim();

    if (!trimmedName) {
      newErrors.name = 'Nama Produk wajib diisi.';
    } else if (trimmedName.length < 3) {
      newErrors.name = 'Minimal 3 karakter.';
    } else if (trimmedName.length > 50) {
      newErrors.name = 'Maksimal 50 karakter.';
    } else {
      // Cek duplikasi nama, pastikan tidak sama dengan produk lain (kecuali dirinya sendiri saat edit)
      const isDuplicate = products.some(
        p => p.name.toLowerCase() === trimmedName.toLowerCase() && p.id !== editingId
      );
      if (isDuplicate) {
        newErrors.name = 'Nama Produk sudah ada.';
      }
    }

    if (description.length > 200) {
      newErrors.description = 'Deskripsi maksimal 200 karakter.';
    }

    return newErrors;
  };

  // Fungsi untuk mereset form ke kondisi awal
  const resetForm = () => {
    setName('');
    setDescription('');
    setErrors({});
    setEditingId(null);
  };

  // Fungsi untuk menampilkan notifikasi toast
  const showToastMsg = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  // Fungsi yang dijalankan saat form disubmit (Tambah atau Update)
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToastMsg('Periksa kembali input Anda.', 'danger');
      return;
    }

    if (editingId === null) {
      // --- LOGIKA CREATE ---
      const newProduct = {
        id: Date.now(),
        name: name.trim(),
        description: description.trim(),
      };
      setProducts([newProduct, ...products]);
      showToastMsg('Produk berhasil ditambahkan.', 'success');
    } else {
      // --- LOGIKA UPDATE ---
      setProducts(products.map(p =>
        p.id === editingId
          ? { ...p, name: name.trim(), description: description.trim() }
          : p
      ));
      showToastMsg('Produk berhasil diperbarui.', 'success');
    }

    resetForm();
  };

  // Fungsi untuk mengisi form saat tombol "Edit" diklik
  const handleEdit = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description || '');
    setErrors({});
  };

  // Fungsi untuk menghapus produk
  const handleDelete = (id) => {
    const target = products.find(p => p.id === id);
    if (!target) return;

    if (window.confirm(`Apakah Anda yakin ingin menghapus produk "${target.name}"?`)) {
      // --- LOGIKA DELETE ---
      setProducts(products.filter(p => p.id !== id));
      if (editingId === id) resetForm(); // Jika yang dihapus sedang diedit, reset form
      showToastMsg('Produk berhasil dihapus.', 'success');
    }
  };
  
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  // Variabel bantu untuk UI
  const descriptionCount = `${description.length}/200`;
  const isEditing = editingId !== null;

  return (
    <Container className="py-4">
      <Row>
        {/* Kolom Form */}
        <Col lg={5}>
          <Card className="mb-4">
            <Card.Header as="h5">{isEditing ? 'Edit Produk' : 'Tambah Produk'}</Card.Header>
            <Card.Body>
              <Form noValidate onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="productName">
                  <Form.Label>Nama Produk</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Contoh: Sembako"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                    }}
                    isInvalid={!!errors.name}
                    maxLength={50}
                  />
                  <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="productDescription">
                  <Form.Label>Deskripsi (Opsional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Tulis deskripsi produk (maks. 200 karakter)"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
                    }}
                    isInvalid={!!errors.description}
                    maxLength={200}
                  />
                  <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                </Form.Group>

                <div className="d-flex justify-content-between">
                  <Form.Text muted>Berikan deskripsi singkat.</Form.Text>
                  <Form.Text muted>{descriptionCount}</Form.Text>
                </div>

                <div className="d-flex gap-2 mt-3">
                  <Button type="submit" variant={isEditing ? 'primary' : 'success'}>
                    {isEditing ? 'Simpan Perubahan' : 'Tambah Produk'}
                  </Button>
                  {isEditing && (
                    <Button type="button" variant="secondary" onClick={resetForm}>Batal</Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Kolom Tabel */}
        <Col lg={7}>
          <Card>
            <Card.Header as="h5">Daftar Produk</Card.Header>
            <Card.Body className="p-0">
              <Table striped bordered hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th style={{ width: 60 }} className="text-center">#</th>
                    <th>Nama</th>
                    <th>Deskripsi</th>
                    <th style={{ width: 180 }} className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-muted">
                        Belum ada data Produk.
                      </td>
                    </tr>
                  ) : (
                    products.map((product, idx) => (
                      <tr key={product.id}>
                        <td className="text-center">{idx + 1}</td>
                        <td>{product.name}</td>
                        <td>{product.description}</td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <Button size="sm" variant="warning" onClick={() => handleEdit(product)}>Edit</Button>
                            <Button size="sm" variant="danger" onClick={() => handleDelete(product.id)}>Hapus</Button>
                          </div>
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

      {/* Komponen Toast Notification */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Header closeButton>
            <strong className="me-auto">Notifikasi</strong>
            <small>Baru saja</small>
          </Toast.Header>
          <Toast.Body className={toastVariant === 'danger' ? 'text-white' : ''}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}