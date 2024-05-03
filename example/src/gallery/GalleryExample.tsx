import React, { useRef } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { Gallery, type GalleryType } from 'react-native-zoom-toolkit';

import GalleryImage from './GalleryImage';

const iss = [
  'https://kutyaknak.hu/shop_ordered/73803/pic/gsp.jpg',
  'https://cdn.britannica.com/02/132502-050-F4667944/macaw.jpg',
  'https://assets-global.website-files.com/63634f4a7b868a399577cf37/64665685a870fadf4bb171c2_labrador%20americano.jpg',
  'https://i0.wp.com/bcc-newspack.s3.amazonaws.com/uploads/2023/05/052323-Foxes-in-Millennium-Park-Colin-Boyle-9124.jpg?fit=1650%2C1099&ssl=1',
  'https://images.saymedia-content.com/.image/ar_1:1%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cq_auto:eco%2Cw_1200/MjAxMTY5NTU4ODY4ODYyNDg2/dalmatian-guide.jpg',
  'https://bestfriends.org/sites/default/files/styles/hero_mobile/public/hero-dash/Asana3808_Dashboard_Standard.jpg?h=ebad9ecf&itok=cWevo33k',
];

const GalleryExample = () => {
  const ref = useRef<GalleryType>(null);
  const activeIndex = useSharedValue<number>(0);

  const renderItem = (item: string, index: number) => {
    return <GalleryImage uri={item} index={index} activeIndex={activeIndex} />;
  };

  return (
    <Gallery
      ref={ref}
      data={iss}
      keyExtractor={(item, index) => `${item}-${index}`}
      renderItem={renderItem}
      onIndexChange={(idx) => {
        activeIndex.value = idx;
      }}
    />
  );
};

export default GalleryExample;
