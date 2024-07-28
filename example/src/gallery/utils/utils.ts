import { getAspectRatioSize } from 'react-native-zoom-toolkit';

type SizeVector = { width: number; height: number };

/**
 * @description Determines the size an item must take on the screen
 * @param itemSize Width and height of the image or video
 * @param screenSize Width and height of the screen
 * @param deviceRatio Aspect ratio of the current device, so basically phoneWidth / phoneHeight
 */
export const calculateItemSize = (
  itemSize: SizeVector,
  screenSize: SizeVector,
  deviceRatio: number
): SizeVector => {
  const pictureRatio = itemSize.width / itemSize.height;
  let size = getAspectRatioSize({
    aspectRatio: pictureRatio,
    width: screenSize.height > screenSize.width ? screenSize.width : undefined,
    height:
      screenSize.height > screenSize.width ? undefined : screenSize.height,
  });

  if (pictureRatio > deviceRatio && deviceRatio > 1) {
    size = getAspectRatioSize({
      aspectRatio: pictureRatio,
      height: screenSize.width,
    });
  }

  if (pictureRatio < deviceRatio && deviceRatio < 1) {
    size = getAspectRatioSize({
      aspectRatio: pictureRatio,
      height: screenSize.height,
    });
  }

  return size;
};
