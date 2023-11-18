let image;
let sensor;
let play;
let time;

export async function POST({ request }) {
  const { ultrasonic, playlist, rtc, base64 } = await request.json();
  image = base64 || image;
  sensor = ultrasonic || sensor;
  play = playlist || play;
  time = rtc || time;

  return new Response(JSON.stringify({ message: 'Data Updated' }), {
    headers: {
      'Content-Type': 'application/json',
    },
    status: 200,
  });
}

export async function GET({ request }) {
  if (!image) {
    return new Response(JSON.stringify({ message: 'No Data Available' }), {
      headers: {
        'Content-Type': 'application/json',
      },
      status: 404,
    });
  }

  return new Response(JSON.stringify({ image, sensor, play, time }), {
    headers: {
      'Content-Type': 'application/json',
    },
    status: 200,
  });
}
