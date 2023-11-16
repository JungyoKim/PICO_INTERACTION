<script>
  import { onMount } from 'svelte';
  let imageSrc = '';
  let prevImageSrc = '';
  let key = 0;

  onMount(async () => {
    const fetchImage = async () => {
      const response = await fetch('/api');
      const data = await response.json();

      if (response.ok) {
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
        setTimeout(fetchImage, 10);
      }
    }

    fetchImage();
  });
</script>

<style>
  body, html {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden;
  }

  .fade-in {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 100%;
    width: 100%;
    object-fit: cover;
    animation: fadein 2s;
  }

  .fade-out {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 100%;
    width: 100%;
    object-fit: cover;
    animation: fadeout 2s;
  }

  @keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes fadeout {
    from { opacity: 1; }
    to   { opacity: 0; }
  }
</style>

{#if prevImageSrc !== ''}
  <img key={key} class="fade-out" src={prevImageSrc} alt="Previous image" />
{/if}
<img key={key} class="fade-in" src={imageSrc} alt="Current image" />
