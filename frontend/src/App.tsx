import { useState, type SubmitEvent } from 'react'
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

const starterItems: CartItem[] = [{ id: 1, product: 'milk', quantity: '1' }]

function App() {
  const [items, setItems] = useState<CartItem[]>(starterItems)
  const [lat, setLat] = useState('49.2827')
  const [lng, setLng] = useState('-123.1207')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<RecommendationResult | null>(null)

  const updateItem = (id: number, field: 'product' | 'quantity', value: string) => {
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    )
  }

  const addRow = () => {
    setItems((currentItems) => [
      ...currentItems,
      { id: Date.now(), product: '', quantity: '1' },
    ])
  }

  const removeRow = (id: number) => {
    setItems((currentItems) => {
      if (currentItems.length === 1) {
        return currentItems
      }

      return currentItems.filter((item) => item.id !== id)
    })
  }

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setResult(null)

    const normalizedItems: RequestItem[] = items
      .map(({ product, quantity }) => {
        const trimmedProduct = product.trim()
        const parsedQuantity = Math.floor(Number(quantity))

        return {
          product: trimmedProduct,
          quantity: Number.isNaN(parsedQuantity) || parsedQuantity <= 0 ? 0 : parsedQuantity,
        }
      })
      .filter((it) => it.product && it.quantity > 0)

    if (normalizedItems.length === 0) {
      setError('Add at least one valid product with quantity > 0.')
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
        throw new Error(data.error || 'Unable to get a recommendation right now.')
      }

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
                <tr key={item.id}>
                  <td>
                    <input
                      type="text"
                      value={item.product}
                      placeholder="e.g. milk"
                      onChange={(event) => updateItem(item.id, 'product', event.target.value)}
                    />
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
              ))}
            </tbody>
          </table>

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
                  <li>Total price: {result.best.total_price}</li>
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
                      <strong>{alternative.name || 'Store'}</strong> - {alternative.total_price} ·{' '}
                      {alternative.distance} km · score {alternative.score}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}
      </section>
    </main>
  )
}

export default App
