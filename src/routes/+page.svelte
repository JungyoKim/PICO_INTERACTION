<script>
  import { onMount } from 'svelte';
  import { spring } from 'svelte/motion';
  import { fade,slide } from 'svelte/transition'
  let imageSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAL4AAAC+CAYAAACLdLWdAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAo0lEQVR4nO3BMQEAAADCoPVPbQsvoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAngY07AABPEnEPQAAAABJRU5ErkJggg==';
  let prevImageSrc = '';
  let ultrasonic = '';
  let colorClass = '';
  let key = 0;
  let colorClasses = ['bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500'];
  let ultrasonicWidth = spring(0);
  let playlist = 0;
  let rtc = 0;
  let prevRtc = 0;
  let audio;
  let isAudioInit = false;
  let sounds = ['/piano/FX_piano01.mp3', '/piano/FX_piano03.mp3', '/piano/FX_piano05.mp3', '/piano/FX_piano06.mp3', '/piano/FX_piano08.mp3', '/piano/FX_piano10.mp3', 'piano/FX_piano12.mp3'];

    let isModalOpen = true;

  function closeModal() {
    isModalOpen = false;
  }

  function initAudio() {
    if (typeof window !== 'undefined' && !isAudioInit) {
      audio = new Audio();
      audio.play();
      isAudioInit = true;
      fetchData();
    }
  }

  onMount(async () => {
    if (typeof window !== 'undefined') {
      audio = new Audio();
    }
  });

  const fetchData = async () => {
    const response = await fetch('/api');
    const data = await response.json();

    if (response.ok && isAudioInit) {
      let newImageSrc = 'data:image/png;base64,' + data.image;
      if (newImageSrc !== imageSrc) {
        prevImageSrc = imageSrc;
        const img = new Image();
        img.src = newImageSrc;
        img.onload = () => {
          imageSrc = newImageSrc;
          key++;
        };
      }
      ultrasonic = data.sensor;
      let displayUltrasonic = ultrasonic > 50 ? 50 : ultrasonic;
      const colorIndex = Math.floor(displayUltrasonic / (50 / colorClasses.length));
      colorClass = colorClasses[colorIndex] || 'bg-purple-500';

      ultrasonicWidth.set((displayUltrasonic / 50) * 100);
      
      playlist = data.play;
      rtc = data.time;

      if (rtc !== prevRtc && typeof window !== 'undefined' && audio.ended) {
        let soundIndex = Math.floor(displayUltrasonic / (50 / 7));
        soundIndex = ultrasonic > 50 ? 6 : soundIndex;
        audio.src = sounds[soundIndex];
        audio.play();
      

        // audio.onended = async () => {
        //   const response = await fetch('/api', {
        //     method: 'POST',
        //     headers: {
        //       'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ playlist: 0 }),
        //   });
        //   if (response.ok) {
        //     playlist = 0;
        //   }
        // };
      }

      prevRtc = rtc;
    }

    setTimeout(fetchData, 1000);
  }
</script>


<style>
  .sensor-container {
    position: absolute;
    top: 0;
    z-index: 10;
    width: 100%;
  }

  .image-container {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 5;
  }

  .image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>

{#if ultrasonic}
<div transition:slide class="sensor-container text-white container max-w-screen mx-auto px-4 sm:px-6 md:px-8">
  <div class="p-4 rounded w-full">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold">Ultrasonic</h2>
      <h2 class="font-bold">{ultrasonic}cm</h2>
    </div>
    <div id="output" class="h-5 w-full rounded-md {colorClass}" style="width: {$ultrasonicWidth}%; max-width: 100%;"></div>
  </div>
</div>
{/if}

<div transition:slide class="image-container">
  <img key={key} src={imageSrc} alt="" />
</div>

{#if isModalOpen}
<div class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
  <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

    <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

    <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
      <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div class="sm:flex sm:items-start">
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              1조 정보수행
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                소리 API 허용 후 시작
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm" on:click={()=>{initAudio();closeModal();}}>
          시작
        </button>
      </div>
    </div>
  </div>
</div>
{/if}