import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  ChevronDown,
  Edit3,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  type Product,
  type ProductPayload,
} from "../../lib/api";

type ProductForm = {
  name: string;
  description: string;
  price: string;
  quantity: string;
  category: string;
  sku: string;
};

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  quantity: "",
  category: "",
  sku: "",
};

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const [error, setError] = useState("");

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load products.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(products.map((product) => product.category)),
      ),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      const matchesCategory =
        category === "All" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const totalProducts = products.length;

  const lowStock = products.filter(
    (product) => product.quantity > 0 && product.quantity <= 10,
  ).length;

  const outOfStock = products.filter(
    (product) => product.quantity === 0,
  ).length;

  function openCreateModal() {
    setEditingProduct(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);

    setForm({
      name: product.name,
      description: product.description ?? "",
      price: String(product.price),
      quantity: String(product.quantity),
      category: product.category,
      sku: product.sku,
    });

    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingProduct(null);
    setForm(emptyForm);
    setError("");
  }

  function updateField(
    field: keyof ProductForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload: ProductPayload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        quantity: Number(form.quantity),
        category: form.category.trim(),
        sku: form.sku.trim(),
      };

      if (editingProduct) {
        const updated = await updateProduct(
          editingProduct.id,
          payload,
        );

        setProducts((current) =>
          current.map((product) =>
            product.id === updated.id ? updated : product,
          ),
        );
      } else {
        const created = await createProduct(payload);
        setProducts((current) => [created, ...current]);
      }

      closeModal();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save product.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await deleteProduct(product.id);

      setProducts((current) =>
        current.filter((item) => item.id !== product.id),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete product.",
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-7 lg:px-10 lg:py-10">

        {/* Header */}

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-violet-400">
              <Package size={14} />
              Operations
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">
              Products
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
              Manage your product catalog, pricing, availability, and
              operational inventory from one place.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            <Plus size={17} />
            Add product
          </button>
        </div>

        {/* Stats */}

        <div className="mt-9 grid gap-3 sm:grid-cols-3">
          <Stat
            label="Total products"
            value={totalProducts}
          />

          <Stat
            label="Low stock"
            value={lowStock}
            accent="amber"
          />

          <Stat
            label="Out of stock"
            value={outOfStock}
            accent="red"
          />
        </div>

        {/* Main panel */}

        <div className="mt-7 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101012]">

          {/* Toolbar */}

          <div className="flex flex-col gap-4 border-b border-white/[0.07] p-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="relative w-full lg:max-w-sm">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search products..."
                className="h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.025] pl-10 pr-4 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-violet-400/40 focus:bg-white/[0.04]"
              />
            </div>

            <div className="relative">
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                className="h-10 appearance-none rounded-lg border border-white/[0.08] bg-white/[0.025] pl-3.5 pr-9 text-sm text-zinc-300 outline-none focus:border-violet-400/40"
              >
                {categories.map((item) => (
                  <option
                    key={item}
                    value={item}
                    className="bg-[#111113]"
                  >
                    {item}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600"
              />
            </div>
          </div>

          {/* Error */}

          {error && (
            <div className="border-b border-red-400/10 bg-red-500/[0.05] px-5 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Loading */}

          {loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-xl bg-white/[0.025]"
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
              <div className="grid size-12 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-zinc-500">
                <Archive size={20} />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-zinc-200">
                No products found
              </h3>

              <p className="mt-1 max-w-sm text-sm text-zinc-600">
                Try changing your search or create your first product.
              </p>

              <button
                onClick={openCreateModal}
                className="mt-5 text-sm font-medium text-violet-400 hover:text-violet-300"
              >
                Add a product →
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-white/[0.06] text-left">
                    <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                      Product
                    </th>

                    <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                      SKU
                    </th>

                    <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                      Category
                    </th>

                    <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                      Price
                    </th>

                    <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                      Stock
                    </th>

                    <th className="px-5 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/[0.05]">
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="group transition hover:bg-white/[0.018]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-violet-300">
                            <Package size={17} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-zinc-100">
                              {product.name}
                            </p>

                            <p className="mt-0.5 max-w-[300px] truncate text-xs text-zinc-600">
                              {product.description ||
                                "No description"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-zinc-500">
                        {product.sku}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-md border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-xs text-zinc-400">
                          {product.category}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-zinc-200">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4">
                        <StockBadge
                          quantity={product.quantity}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1 opacity-60 transition group-hover:opacity-100">
                          <button
                            onClick={() =>
                              openEditModal(product)
                            }
                            title="Edit product"
                            className="grid size-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(product)
                            }
                            title="Delete product"
                            className="grid size-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-red-500/10 hover:text-red-300"
                          >
                            <Trash2 size={15} />
                          </button>

                          <button
                            title="More"
                            className="grid size-8 place-items-center rounded-lg text-zinc-600 hover:bg-white/[0.06] hover:text-zinc-300"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}

          {!loading && filteredProducts.length > 0 && (
            <div className="border-t border-white/[0.06] px-5 py-3 text-xs text-zinc-600">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          )}
        </div>
      </div>

      {/* Modal */}

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.1] bg-[#111113] shadow-2xl shadow-black/60">

            <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-violet-400">
                  Catalog
                </p>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  {editingProduct
                    ? "Edit product"
                    : "Create product"}
                </h2>
              </div>

              <button
                onClick={closeModal}
                className="grid size-8 place-items-center rounded-lg text-zinc-500 hover:bg-white/[0.06] hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Product name"
                  value={form.name}
                  onChange={(value) =>
                    updateField("name", value)
                  }
                  placeholder="Wireless Mouse"
                  required
                />

                <Field
                  label="SKU"
                  value={form.sku}
                  onChange={(value) =>
                    updateField("sku", value)
                  }
                  placeholder="WM-001"
                  required
                />

                <Field
                  label="Category"
                  value={form.category}
                  onChange={(value) =>
                    updateField("category", value)
                  }
                  placeholder="Accessories"
                  required
                />

                <Field
                  label="Price"
                  type="number"
                  value={form.price}
                  onChange={(value) =>
                    updateField("price", value)
                  }
                  placeholder="1299"
                  required
                />

                <Field
                  label="Quantity"
                  type="number"
                  value={form.quantity}
                  onChange={(value) =>
                    updateField("quantity", value)
                  }
                  placeholder="50"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-400">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value,
                    )
                  }
                  rows={3}
                  placeholder="Short description of the product..."
                  className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 py-3 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-violet-400/40"
                />
              </div>

              {error && (
                <p className="text-sm text-red-300">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t border-white/[0.07] pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                >
                  Cancel
                </button>

                <button
                  disabled={saving}
                  type="submit"
                  className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingProduct
                      ? "Save changes"
                      : "Create product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent = "violet",
}: {
  label: string;
  value: number;
  accent?: "violet" | "amber" | "red";
}) {
  const iconClasses = {
    violet: "bg-violet-500/10 text-violet-300",
    amber: "bg-amber-500/10 text-amber-300",
    red: "bg-red-500/10 text-red-300",
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#101012] p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-600">
          {label}
        </span>

        <span
          className={`grid size-8 place-items-center rounded-lg ${iconClasses[accent]}`}
        >
          <Package size={15} />
        </span>
      </div>

      <p className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-white">
        {value}
      </p>
    </div>
  );
}

function StockBadge({
  quantity,
}: {
  quantity: number;
}) {
  if (quantity === 0) {
    return (
      <span className="inline-flex rounded-full border border-red-400/15 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-300">
        Out of stock
      </span>
    );
  }

  if (quantity <= 10) {
    return (
      <span className="inline-flex rounded-full border border-amber-400/15 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300">
        {quantity} · Low
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-emerald-400/15 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
      {quantity} · Healthy
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-zinc-400">
        {label}
      </label>

      <input
        required={required}
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        min={type === "number" ? 0 : undefined}
        step={type === "number" ? "any" : undefined}
        className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-violet-400/40"
      />
    </div>
  );
}

export default Products;