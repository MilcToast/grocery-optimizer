import React, { useState, type SubmitEvent } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

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

type Coordinates = {
  lat: number
  lon: number
}

type ServerValidationError = {
  index: number
  product?: string
  quantity?: number
  message: string
}

const starterItems: CartItem[] = [{ id: 1, product: 'milk', quantity: '1' }]

function App() {
  const [items, setItems] = useState<CartItem[]>(starterItems)
  const [address, setAddress] = useState('')
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [locationLabel, setLocationLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({})
  const [result, setResult] = useState<RecommendationResult | null>(null)

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
    setRowErrors((errs) => {
      if (!errs[id]) return errs
      const next = { ...errs }
      delete next[id]
      return next
    })
  }

  const resolveCoordinates = async (): Promise<Coordinates> => {
    if (coordinates) {
      return coordinates
    }

    const trimmedAddress = address.trim()

    if (trimmedAddress) {
      const geocodeResponse = await fetch(`${API_URL}/api/geocode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: trimmedAddress }),
      })

      const geocodeData = await geocodeResponse.json()

      if (!geocodeResponse.ok) {
        throw new Error(geocodeData.error || 'Unable to find that address.')
      }

      const lat = Number(geocodeData.lat)
      const lon = Number(geocodeData.lon)

      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        throw new Error('Unable to find coordinates for that address.')
      }

      const resolvedCoordinates = { lat, lon }
      setCoordinates(resolvedCoordinates)
      setLocationLabel(`Using address: ${trimmedAddress}`)
      return resolvedCoordinates
    }

    if (!navigator.geolocation) {
      throw new Error('This browser does not support geolocation.')
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const nextCoordinates = {
            lat: coords.latitude,
            lon: coords.longitude,
          }

          setCoordinates(nextCoordinates)
          setAddress('')
          setLocationLabel(`Using your current location (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`)
          resolve(nextCoordinates)
        },
        (geoError) => {
          reject(new Error(geoError.message || 'Unable to access your location.'))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
        },
      )
    })
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('This browser does not support geolocation.')
      return
    }

    setLoading(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nextCoordinates = {
          lat: coords.latitude,
          lon: coords.longitude,
        }

        setCoordinates(nextCoordinates)
        setAddress('')
        setLocationLabel(`Using your current location (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`)
        setLoading(false)
      },
      (geoError) => {
        setLoading(false)
        setError(geoError.message || 'Unable to access your location.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    )
  }

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setResult(null)

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
      const targetCoordinates = await resolveCoordinates()

      const response = await fetch(`${API_URL}/api/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: normalizedItems,
          lat: targetCoordinates.lat,
          lon: targetCoordinates.lon,
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
          <div className="location-panel">
            <label className="address-field">
              <span>Address</span>
              <input
                type="text"
                value={address}
                placeholder="123 Main St, Vancouver, BC"
                onChange={(event) => {
                  setAddress(event.target.value)
                  setCoordinates(null)
                  setLocationLabel('')
                }}
              />
            </label>

            <div className="location-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={handleUseMyLocation}
                disabled={loading}
              >
                Use my location
              </button>
            </div>

            {locationLabel ? <p className="location-status">{locationLabel}</p> : null}
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
    </main>
  )
}

export default App
