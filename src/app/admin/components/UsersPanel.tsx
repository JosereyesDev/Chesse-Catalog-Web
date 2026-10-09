"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  AlertTriangle,
  UserCheck,
} from "lucide-react";

interface Customer {
  id: number;
  cedula: string;
  name: string;
  phone: string;
  address: string;
  created_at: string;
}

type Toast = { type: "success" | "error"; message: string } | null;

// Función de formateo de Cédula de Identidad o RIF
function formatCedulaORif(input: string): string {
  if (!input) return "";

  let raw = input.toUpperCase().trim();

  // Si el usuario borra todo hasta dejar solo 'V' o solo un carácter no numérico
  if (raw.length === 1 && !/\d/.test(raw)) {
    return ["V", "E", "J", "G", "C"].includes(raw) ? raw : "V";
  }

  // Determinar la letra inicial (V por defecto si empieza por número)
  let letter = "V";
  const firstChar = raw.charAt(0);
  if (["V", "E", "J", "G", "C"].includes(firstChar)) {
    letter = firstChar;
  }

  // Extraer solo los números
  let digits = raw.replace(/\D/g, "");

  // Si es persona natural (V o E) y los números superan 80.000.000, pasa a 'E'
  if ((letter === "V" || letter === "E") && digits.length >= 8 && parseInt(digits.substring(0, 8), 10) > 80000000) {
    letter = "E";
  }

  // Limitar longitud máxima de números
  const maxDigits = (letter === "J" || letter === "G" || letter === "C") ? 9 : 8;
  if (digits.length > maxDigits) {
    digits = digits.substring(0, maxDigits);
  }

  // Si no hay dígitos aún, devolver solo la letra (sin forzar el guión permanentemente)
  if (!digits) {
    return raw.endsWith("-") ? `${letter}-` : letter;
  }

  return `${letter}-${digits}`;
}

export function UsersPanel({
  supabase,
}: {
  supabase: ReturnType<typeof createClient> | null;
}) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Partial<Customer> | null>(null);
  
  // Estados para los campos del modal
  const [cedula, setCedula] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  const showToast = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 2800);
  };

  const fetchCustomers = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (err: any) {
      console.error("Error al cargar usuarios:", err);
      showToast({ type: "error", message: "Error al cargar los usuarios" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [supabase]);

  // Sincronizar estados del modal al abrir/editar
  useEffect(() => {
    if (modalOpen) {
      if (editingCustomer?.id) {
        setCedula(formatCedulaORif(editingCustomer.cedula || ""));
        setName((editingCustomer.name || "").toUpperCase());
        setPhone(editingCustomer.phone || "");
        setAddress((editingCustomer.address || "").toUpperCase());
      } else {
        setCedula("");
        setName("");
        setPhone("");
        setAddress("");
      }
    }
  }, [modalOpen, editingCustomer]);

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;

    return customers.filter(
      (c) =>
        c.cedula.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) {
      setCedula("");
      return;
    }
    setCedula(formatCedulaORif(val));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!supabase) return;

    const formattedCedula = cedula.trim();
    const formattedName = name.trim().toUpperCase();
    const formattedPhone = phone.trim();
    const formattedAddress = address.trim().toUpperCase();

    if (!formattedCedula || !formattedName || !formattedPhone || !formattedAddress) {
      showToast({ type: "error", message: "Todos los campos son obligatorios" });
      return;
    }

    setSaving(true);
    try {
      if (editingCustomer?.id) {
        const { error } = await supabase
          .from("customers")
          .update({
            cedula: formattedCedula,
            name: formattedName,
            phone: formattedPhone,
            address: formattedAddress,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingCustomer.id);
        if (error) throw error;
        showToast({ type: "success", message: "Usuario actualizado" });
      } else {
        const { error } = await supabase.from("customers").insert([
          {
            cedula: formattedCedula,
            name: formattedName,
            phone: formattedPhone,
            address: formattedAddress,
          },
        ]);
        if (error) throw error;
        showToast({ type: "success", message: "Usuario registrado" });
      }
      setModalOpen(false);
      setEditingCustomer(null);
      fetchCustomers();
    } catch (err: any) {
      console.error(err);
      showToast({ type: "error", message: err.message || "Error al guardar el usuario" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!supabase) return;
    if (!confirm(`¿Estás seguro de eliminar al usuario ${name}?`)) return;

    setDeletingId(id);
    try {
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (error) throw error;

      setCustomers((prev) => prev.filter((c) => c.id !== id));
      showToast({ type: "success", message: "Usuario eliminado" });
    } catch (err: any) {
      console.error(err);
      showToast({ type: "error", message: "No se pudo eliminar el usuario" });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", padding: "3rem 1rem", justifyContent: "center" }}>
        <Loader2 className="animate-spin" size={24} color="var(--azul-rey)" />
        <span>Cargando lista de usuarios...</span>
      </div>
    );
  }

  return (
    <div>
      {!supabase && (
        <div className="admin-alert">
          <AlertTriangle size={20} />
          <div><strong>Sin conexión a la base de datos.</strong></div>
        </div>
      )}

      <div className="admin-title-row">
        <div>
          <h2>Gestión de Clientes</h2>
          <p>Consulta y administra los clientes registrados con su número de cédula.</p>
        </div>
        <button
          onClick={() => {
            setEditingCustomer({});
            setModalOpen(true);
          }}
          className="admin-btn-add"
        >
          <Plus size={18} /> Nuevo Usuario
        </button>
      </div>

      <div className="admin-toolbar" style={{ marginBottom: "1.5rem" }}>
        <div className="admin-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por cédula, nombre, teléfono o dirección..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cédula / RIF</th>
                <th>Nombre / Razón Social</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Fecha Registro</th>
                <th className="right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="admin-empty">
                      <Users size={40} className="icon" style={{ opacity: 0.4 }} />
                      <strong>No se encontraron usuarios</strong>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <strong style={{ color: "var(--azul-rey)" }}>{customer.cedula}</strong>
                    </td>
                    <td>{customer.name}</td>
                    <td>{customer.phone}</td>
                    <td style={{ maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {customer.address}
                    </td>
                    <td>{new Date(customer.created_at).toLocaleDateString("es-ES")}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          onClick={() => {
                            setEditingCustomer(customer);
                            setModalOpen(true);
                          }}
                          className="admin-action-btn edit"
                          title="Editar usuario"
                        >
                          <Edit2 size={17} />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id, customer.name)}
                          disabled={deletingId === customer.id}
                          className="admin-action-btn delete"
                          title="Eliminar usuario"
                        >
                          {deletingId === customer.id ? (
                            <Loader2 size={17} className="animate-spin" />
                          ) : (
                            <Trash2 size={17} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear/Editar */}
      {modalOpen && (
        <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal-box" style={{ maxWidth: 500 }}>
            <button className="modal-close" onClick={() => setModalOpen(false)}>
              <X size={20} />
            </button>
            <div className="admin-modal-header">
              <div className="admin-modal-icon create">
                <UserCheck size={20} />
              </div>
              <div>
                <h3>{editingCustomer?.id ? "Editar Usuario" : "Nuevo Usuario"}</h3>
                <p>Ingresa los datos del cliente</p>
              </div>
            </div>

            <form onSubmit={handleSave}>
              <div className="admin-form-grid">
                <div className="admin-form-group span-2">
                  <label>Cédula de Identidad o RIF</label>
                  <input
                    name="cedula"
                    value={cedula}
                    onChange={handleCedulaChange}
                    required
                    placeholder="Ej: V-12345678 o J-123456789"
                  />
                </div>
                <div className="admin-form-group span-2">
                  <label>Nombre y Apellido / Razón Social</label>
                  <input
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value.toUpperCase())}
                    style={{ textTransform: "uppercase" }}
                    required
                    placeholder="EJ: MARÍA GÓMEZ O INVERSIONES LOS ANDES C.A."
                  />
                </div>
                <div className="admin-form-group span-2">
                  <label>Teléfono</label>
                  <input
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="Ej: 0412 123 4567"
                  />
                </div>
                <div className="admin-form-group span-2">
                  <label>Dirección</label>
                  <input
                    name="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value.toUpperCase())}
                    style={{ textTransform: "uppercase" }}
                    required
                    placeholder="CALLE, NÚMERO, PISO/DEPTO, SECTOR"
                  />
                </div>
              </div>

              <div className="admin-form-actions" style={{ marginTop: "1.5rem" }}>
                <button type="button" onClick={() => setModalOpen(false)} className="admin-btn-cancel">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="admin-btn-save">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.type === "success" ? <Check size={16} /> : <X size={16} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}