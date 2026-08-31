import React, { useEffect, useState, type SubmitEvent } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL

type CartItem = {
  id: number
  product: string
  quantity: string
}

type RecommendationResult = {
  best?: {
    name?: string
    total_price?: string | number
    distance?: number
    score?: number
  }
  alternatives?: Array<{
    name?: string
    total_price?: string | number
    distance?: number
    score?: number
  }>
}

type RequestItem = {
  product: string
  quantity: number
}

type ServerValidationError = {
  index: number
  product?: string
  quantity?: number
  message: string
}

type ProductsResponse = {
  products?: string[]
}

const starterItems: CartItem[] = [{ id: 1, product: '', quantity: '1' }]

function App() {
  const [items, setItems] = useState<CartItem[]>(starterItems)
  const [lat, setLat] = useState('49.2827')
  const [lng, setLng] = useState('-123.1207')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({})
  const [result, setResult] = useState<RecommendationResult | null>(null)
  const [productOptions, setProductOptions] = useState<string[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')

  useEffect(() => {
    let isActive = true

    const loadProducts = async () => {
      setProductsLoading(true)
      setProductsError('')

      try {
        const response = await fetch(`${API_URL}/products`)
        const data = (await response.json()) as ProductsResponse

        if (!response.ok) {
          throw new Error('Unable to load products.')
        }

        const products = Array.isArray(data.products) ? data.products : []

        if (!isActive) return

        setProductOptions(products)

        // Give an initial default selection so the first row is usable immediately.
        if (products.length > 0) {
          setItems((currentItems) =>
            currentItems.map((item) =>
              item.product.trim() ? item : { ...item, product: products[0] },
            ),
          )
        }
      } catch {
        if (!isActive) return
        setProductsError('Could not load product list. Try refreshing the page.')
      } finally {
        if (isActive) {
          setProductsLoading(false)
        }
      }
    }

    void loadProducts()

    return () => {
      isActive = false
    }
  }, [])

  const updateItem = (id: number, field: 'product' | 'quantity', value: string) => {
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    )
    setRowErrors((errs) => {
      if (!errs[id]) return errs
      const next = { ...errs }
      delete next[id]
      return next
    })
  }

  const addRow = () => {
    setItems((currentItems) => [
      ...currentItems,
      { id: Date.now(), product: productOptions[0] ?? '', quantity: '1' },
    ])
  }

  const removeRow = (id: number) => {
    setItems((currentItems) => {
      if (currentItems.length === 1) {
        return currentItems
      }

      return currentItems.filter((item) => item.id !== id)
    })
    setRowErrors((errs) => {
      if (!errs[id]) return errs
      const next = { ...errs }
      delete next[id]
      return next
    })
  }

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setResult(null)

    // Validate latitude and longitude
    const parsedLat = Number(lat)
    const parsedLng = Number(lng)

    if (
      !Number.isFinite(parsedLat) ||
      !Number.isFinite(parsedLng) ||
      parsedLat < -90 ||
      parsedLat > 90 ||
      parsedLng < -180 ||
      parsedLng > 180
    ) {
      setError('Enter a valid latitude and longitude.')
      return
    }

    // Per-row validation: reject empty product names, invalid quantities,
    // non-integer quantities, and quantities <= 0.
    const newRowErrors: Record<number, string> = {}
    const normalizedItems: RequestItem[] = []

    items.forEach((row) => {
      const trimmed = row.product.trim()
      const raw = row.quantity

      if (!trimmed) {
        newRowErrors[row.id] = 'Product name cannot be empty.'
        return
      }

      if (raw === '' || raw == null) {
        newRowErrors[row.id] = 'Quantity is required.'
        return
      }

      const parsed = Number(raw)
      if (!Number.isFinite(parsed)) {
        newRowErrors[row.id] = 'Quantity must be a number.'
        return
      }

      if (!Number.isInteger(parsed)) {
        newRowErrors[row.id] = 'Quantity must be an integer.'
        return
      }

      if (parsed <= 0) {
        newRowErrors[row.id] = 'Quantity must be greater than zero.'
        return
      }

      normalizedItems.push({ product: trimmed, quantity: parsed })
    })

    if (Object.keys(newRowErrors).length > 0) {
      setRowErrors(newRowErrors)
      setError('Fix validation errors in the form.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: normalizedItems,
          lat: Number(lat),
          lng: Number(lng),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (Array.isArray(data.errors)) {
          // Map server-side errors (which use row indices) to local row ids
          const serverRowErrors: Record<number, string> = {}
          data.errors.forEach((e: ServerValidationError) => {
            const row = items[e.index]
            if (row) serverRowErrors[row.id] = e.message
          })
          setRowErrors(serverRowErrors)
          setError('Fix validation errors returned by server.')
          return
        }

        throw new Error(data.error || 'Unable to get a recommendation right now.')
      }

      setRowErrors({})
      setResult(data)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="card">
        <h1>Grocery Optimizer</h1>
        <p className="intro">
          Add the products you want to buy, choose a quantity for each one, and let the
          recommendation engine suggest the best store.
        </p>

        <form onSubmit={handleSubmit} className="recommendation-form">
          <div className="location-grid">
            <label>
              <span>Latitude</span>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(event) => setLat(event.target.value)}
              />
            </label>
            <label>
              <span>Longitude</span>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(event) => setLng(event.target.value)}
              />
            </label>
          </div>

          <table className="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <React.Fragment key={item.id}>
                  <tr>
                    <td>
                      <select
                        value={item.product}
                        onChange={(event) => updateItem(item.id, 'product', event.target.value)}
                        disabled={productsLoading || productOptions.length === 0}
                      >
                        <option value="" disabled>
                          {productsLoading ? 'Loading products...' : 'Select a product'}
                        </option>
                        {productOptions.map((productName) => (
                          <option key={productName} value={productName}>
                            {productName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(event) => updateItem(item.id, 'quantity', event.target.value)}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="remove-button"
                        onClick={() => removeRow(item.id)}
                        disabled={items.length === 1}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                  {rowErrors[item.id] ? (
                    <tr key={`${item.id}-error`} className="row-error-row">
                      <td colSpan={3} className="row-error">
                        {rowErrors[item.id]}
                      </td>
                    </tr>
                  ) : null}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {productsError ? (
            <p className="error-message" role="alert">
              {productsError}
            </p>
          ) : null}

          <div className="actions">
            <button type="button" className="secondary-button" onClick={addRow}>
              Add item
            </button>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Searching…' : 'Get recommendation'}
            </button>
          </div>
        </form>

        {error ? (
          <p className="error-message" role="alert">
            {error}
          </p>
        ) : null}

        {result ? (
          <section className="result-panel">
            <h2>Recommendation result</h2>
            {result.best ? (
              <>
                <p className="result-title">{result.best.name || 'Best store'}</p>
                <ul>
                  <li>Total price: ${result.best.total_price}</li>
                  <li>Distance: {result.best.distance} km</li>
                  <li>Score: {result.best.score}</li>
                </ul>
              </>
            ) : (
              <p>No best store could be determined.</p>
            )}

            {result.alternatives && result.alternatives.length > 0 ? (
              <div className="alternatives">
                <h3>Alternatives</h3>
                <ul>
                  {result.alternatives.map((alternative, index) => (
                    <li key={`${alternative.name || 'store'}-${index}`}>
                      <strong>{alternative.name || 'Store'}</strong> - ${alternative.total_price} ·{' '}
                      {alternative.distance} km · score {alternative.score}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}
      </section>
    </main >
  )
}

export default App
