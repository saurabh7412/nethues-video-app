// src/app/page.tsx

import VideoUpload from '@/components/VideoUpload';

const HomePage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center my-8">Nethues Video Processing App</h1>
      <VideoUpload />
    </div>
  );
};

export default HomePage;
