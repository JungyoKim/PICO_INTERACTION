<script>
  import { onMount } from 'svelte';
  
  let ultrasonic = 0;
  let colorClass = 'bg-blue-500';
  let playSwitchState = 0;
  let camSwitchState = 0;
  let playSwitchColor = 'bg-white';
  let camSwitchColor = 'bg-white';
  let limit = 50;

  const colorClasses = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500'];

  let video;
  let canvas;
  let context;

  onMount(async () => {
    context = canvas.getContext("2d");

    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        video.srcObject = stream;
      })
      .catch(error => {
        console.error("There was an error getting user media:", error);
      });
  });

  async function connect() {
  const port = await navigator.serial.requestPort();
  await port.open({ baudRate: 9600 });

  let previousPlaySwitchState = 0;
  let previousCamSwitchState = 0;

  const sendUltrasonicData = async () => {
    const body = { ultrasonic };
    await fetch("/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    setTimeout(sendUltrasonicData, 100);
  };

  sendUltrasonicData();

  while (port.readable) {
    const reader = port.readable.getReader();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        const text = new TextDecoder().decode(value);
        const data = JSON.parse(text);
        ultrasonic = Math.round(data.ultrasonic);
        const width = (ultrasonic / limit) * 100;
        document.documentElement.style.setProperty('--ultrasonic-width', width + '%');
        const colorIndex = Math.floor(ultrasonic / (limit / colorClasses.length));
        colorClass = colorClasses[colorIndex] || 'bg-purple-500';

        playSwitchState = data.play_switch;
        camSwitchState = data.cam_switch;

        if (previousPlaySwitchState !== playSwitchState && playSwitchState === 1) {
          playSwitchColor = 'bg-blue-200';
          setTimeout(() => playSwitchColor = 'bg-white', 1000);
          
          const playlist = colorIndex + 1;
          const rtc = Math.floor(new Date().getTime() / 1000);
          const body = { playlist, rtc };
          fetch("/api", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
          });
        }

        if (previousCamSwitchState !== camSwitchState && camSwitchState === 1) {
          camSwitchColor = 'bg-blue-200';
          setTimeout(() => camSwitchColor = 'bg-white', 1000);

          // Take a photo
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL("image/png").replace("data:image/png;base64,", "");
          console.log(base64)
          const body = { base64 };
          fetch("/api", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
          });
        }
        previousPlaySwitchState = playSwitchState;
        previousCamSwitchState = camSwitchState;
      }
    } catch (error) {
      continue
    } finally {
      reader.releaseLock();
    }
  }
}



</script>

<style>
  :root {
    --ultrasonic-width: 0%;
    --island-height: 240px;
  }

  .container {
    max-width: 1200px;
    margin: auto;
    padding: 0 20px;
  }

  @media (min-width: 768px) {
    .flex-container {
      display: flex;
      justify-content: space-between;
    }
  }
</style>

<div class="bg-gray-800 text-white p-4 mb-4">
  <div class="container">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Admin</h1>
      <button on:click={connect} class="px-4 py-2 bg-blue-500 text-white rounded-xl">기기에 연결</button>
    </div>
  </div>
</div>

<div class="container max-w-screen mx-auto px-4 sm:px-6 md:px-8">
  <div class="bg-white p-4 rounded-xl shadow w-full">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold">Ultrasonic Sensor</h2>
      <span>{ultrasonic}cm</span>
    </div>
    <div id="output" class="h-5 w-full rounded-lg {colorClass}" style="width: var(--ultrasonic-width); max-width: 100%;"></div>
  </div>
</div>


<div class="container flex-container flex-col-reverse md:flex-row">
  <div class="flex-1 ml-0">
    <div class="my-4 p-4 {playSwitchColor} rounded-xl shadow">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-xl font-bold">Play Switch</h2>
        <span>{playSwitchState === 1 ? 'Pressed' : 'Not Pressed'}</span>
      </div>
    </div>
    <div class="my-4 p-4 {camSwitchColor} rounded-xl shadow">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-xl font-bold">Cam Switch</h2>
        <span>{camSwitchState === 1 ? 'Pressed' : 'Not Pressed'}</span>
      </div>
    </div>
  </div>
  <div class="my-4 md:ml-4">
    <video bind:this={video} autoplay playsinline class="w-full rounded-xl shadow"></video>
    <canvas bind:this={canvas} style="display: none;"></canvas>
  </div>
</div>
