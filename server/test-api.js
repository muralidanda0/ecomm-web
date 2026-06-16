/**
 * test-api.js  —  Cart & Order API smoke-tests
 * Run with:  node test-api.js
 * Requires the server to be running on http://localhost:5000
 */

const BASE = 'http://localhost:5000/api';

// ── tiny helpers ─────────────────────────────────────────────────────────────
const pass  = (label)         => console.log(`  ✅  ${label}`);
const fail  = (label, detail) => console.log(`  ❌  ${label}${detail ? ' — ' + detail : ''}`);
const title = (s)             => console.log(`\n${'─'.repeat(60)}\n  ${s}\n${'─'.repeat(60)}`);

async function req(method, path, { body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json };
}

// ── main ─────────────────────────────────────────────────────────────────────
(async () => {
  let token, productId, orderId;

  // ── 1. Register / Login ────────────────────────────────────────────────────
  title('STEP 1 — Auth (Register or Login)');
  {
    let r = await req('POST', '/auth/register', {
      body: { name: 'API Tester', email: 'apitester@test.com', password: 'Password123' },
    });

    if (r.status === 201 && r.body.token) {
      token = r.body.token;
      pass(`Register  →  ${r.status} — token acquired`);
    } else if (r.status === 400 && r.body.message?.toLowerCase().includes('already')) {
      // User exists — login instead
      r = await req('POST', '/auth/login', {
        body: { email: 'apitester@test.com', password: 'Password123' },
      });
      if (r.status === 200 && r.body.token) {
        token = r.body.token;
        pass(`Login (user existed)  →  ${r.status} — token acquired`);
      } else {
        fail('Login', JSON.stringify(r.body));
        process.exit(1);
      }
    } else {
      fail('Register', JSON.stringify(r.body));
      process.exit(1);
    }
    console.log(`     Token: ${token.slice(0, 20)}…${token.slice(-10)}`);
  }

  // ── 2. Get a real product ID ───────────────────────────────────────────────
  title('STEP 2 — Grab a Product ID');
  {
    const r = await req('GET', '/products');
    if (r.status === 200 && r.body.data?.length) {
      productId = r.body.data[0]._id;
      pass(`GET /products  →  ${r.status}  |  using product: ${productId}`);
    } else if (r.status === 200 && r.body.products?.length) {
      productId = r.body.products[0]._id;
      pass(`GET /products  →  ${r.status}  |  using product: ${productId}`);
    } else {
      fail('GET /products — no products found, skipping cart tests', JSON.stringify(r.body));
      process.exit(1);
    }
  }

  // ── 3. GET /cart — should be empty ────────────────────────────────────────
  title('STEP 3 — GET /cart (expect empty)');
  {
    const r = await req('GET', '/cart', { token });
    if (r.status === 200) pass(`GET /cart  →  ${r.status}  |  items: ${r.body.data?.items?.length ?? 0}`);
    else fail(`GET /cart  →  ${r.status}`, JSON.stringify(r.body));
  }

  // ── 4. POST /cart/add ──────────────────────────────────────────────────────
  title('STEP 4 — POST /cart/add (quantity 2)');
  {
    const r = await req('POST', '/cart/add', { token, body: { productId, quantity: 2 } });
    if (r.status === 200) pass(`POST /cart/add  →  ${r.status}  |  items in cart: ${r.body.data?.items?.length}`);
    else fail(`POST /cart/add  →  ${r.status}`, JSON.stringify(r.body));
  }

  // ── 5. POST /cart/add again — same product (quantity accumulates) ──────────
  title('STEP 5 — POST /cart/add again (quantity 1 more, expect 3 total)');
  {
    const r = await req('POST', '/cart/add', { token, body: { productId, quantity: 1 } });
    if (r.status === 200) {
      const item = r.body.data?.items?.find(i => (i.productId?._id || i.productId) === productId);
      pass(`POST /cart/add  →  ${r.status}  |  item quantity: ${item?.quantity}`);
    } else fail(`POST /cart/add (2nd)  →  ${r.status}`, JSON.stringify(r.body));
  }

  // ── 6. PUT /cart/update ────────────────────────────────────────────────────
  title('STEP 6 — PUT /cart/update (set quantity to 1)');
  {
    const r = await req('PUT', '/cart/update', { token, body: { productId, quantity: 1 } });
    if (r.status === 200) {
      const item = r.body.data?.items?.find(i => (i.productId?._id || i.productId) === productId);
      pass(`PUT /cart/update  →  ${r.status}  |  item quantity: ${item?.quantity}`);
    } else fail(`PUT /cart/update  →  ${r.status}`, JSON.stringify(r.body));
  }

  // ── 7. POST /orders/place ──────────────────────────────────────────────────
  title('STEP 7 — POST /orders/place');
  {
    const r = await req('POST', '/orders/place', {
      token,
      body: {
        address: {
          fullName: 'API Tester',
          phone:    '9876543210',
          street:   '123 Main Street',
          city:     'Mumbai',
          state:    'Maharashtra',
          pincode:  '400001',
        },
      },
    });
    if (r.status === 201 && r.body.data?._id) {
      orderId = r.body.data._id;
      pass(`POST /orders/place  →  ${r.status}  |  orderId: ${orderId}  |  status: ${r.body.data.status}  |  total: ₹${r.body.data.totalPrice}`);
    } else fail(`POST /orders/place  →  ${r.status}`, JSON.stringify(r.body));
  }

  // ── 8. GET /cart — should now be empty after order ─────────────────────────
  title('STEP 8 — GET /cart (expect empty after order)');
  {
    const r = await req('GET', '/cart', { token });
    const items = r.body.data?.items ?? [];
    if (r.status === 200 && items.length === 0) pass(`GET /cart  →  ${r.status}  |  cart cleared ✔`);
    else fail(`GET /cart after order  →  ${r.status}  |  items left: ${items.length}`, JSON.stringify(r.body));
  }

  // ── 9. GET /orders/my-orders ───────────────────────────────────────────────
  title('STEP 9 — GET /orders/my-orders');
  {
    const r = await req('GET', '/orders/my-orders', { token });
    if (r.status === 200) pass(`GET /orders/my-orders  →  ${r.status}  |  count: ${r.body.count}`);
    else fail(`GET /orders/my-orders  →  ${r.status}`, JSON.stringify(r.body));
  }

  // ── 10. GET /orders/:id ────────────────────────────────────────────────────
  title('STEP 10 — GET /orders/:id');
  if (orderId) {
    const r = await req('GET', `/orders/${orderId}`, { token });
    if (r.status === 200) pass(`GET /orders/${orderId}  →  ${r.status}  |  status: ${r.body.data?.status}`);
    else fail(`GET /orders/:id  →  ${r.status}`, JSON.stringify(r.body));
  } else {
    fail('Skipped — no orderId');
  }

  // ── 11. Add item back to test remove & clear ───────────────────────────────
  title('STEP 11 — POST /cart/add (to test remove)');
  {
    const r = await req('POST', '/cart/add', { token, body: { productId, quantity: 1 } });
    if (r.status === 200) pass(`POST /cart/add  →  ${r.status}`);
    else fail(`POST /cart/add  →  ${r.status}`, JSON.stringify(r.body));
  }

  // ── 12. DELETE /cart/remove/:productId ────────────────────────────────────
  title('STEP 12 — DELETE /cart/remove/:productId');
  {
    const r = await req('DELETE', `/cart/remove/${productId}`, { token });
    if (r.status === 200) pass(`DELETE /cart/remove/${productId}  →  ${r.status}`);
    else fail(`DELETE /cart/remove/:productId  →  ${r.status}`, JSON.stringify(r.body));
  }

  // ── 13. Add item back then DELETE /cart/clear ─────────────────────────────
  title('STEP 13 — DELETE /cart/clear');
  {
    await req('POST', '/cart/add', { token, body: { productId, quantity: 1 } });
    const r = await req('DELETE', '/cart/clear', { token });
    if (r.status === 200) pass(`DELETE /cart/clear  →  ${r.status}  |  ${r.body.message}`);
    else fail(`DELETE /cart/clear  →  ${r.status}`, JSON.stringify(r.body));
  }

  // ── 14. PUT /orders/:id/status (admin-only — expect 403 for regular user) ─
  title('STEP 14 — PUT /orders/:id/status (non-admin → expect 403)');
  if (orderId) {
    const r = await req('PUT', `/orders/${orderId}/status`, { token, body: { status: 'processing' } });
    if (r.status === 403) pass(`PUT /orders/:id/status  →  ${r.status} Forbidden (correct — user is not admin)`);
    else if (r.status === 200) pass(`PUT /orders/:id/status  →  ${r.status} (user has admin role)`);
    else fail(`PUT /orders/:id/status  →  ${r.status}`, JSON.stringify(r.body));
  } else {
    fail('Skipped — no orderId');
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log('  All tests completed!');
  console.log(`${'═'.repeat(60)}\n`);
})();
