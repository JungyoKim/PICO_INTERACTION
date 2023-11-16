let image;

export async function POST({ request }) {
  const { base64 } = await request.json();

  image = base64;

  return new Response(JSON.stringify({ message: 'Image updated' }), {
    headers: {
      'Content-Type': 'application/json',
    },
    status: 200,
  });
}

export async function GET({ request }) {
  if (!image) {
    return new Response(JSON.stringify({ message: 'No image available' }), {
      headers: {
        'Content-Type': 'application/json',
      },
      status: 404,
    });
  }

  return new Response(JSON.stringify({ image }), {
    headers: {
      'Content-Type': 'application/json',
    },
    status: 200,
  });
}
