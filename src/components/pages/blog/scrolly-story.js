import React, {useState} from 'react'

/*
 * I'm assuming that the incoming data looks something like this:
 * scrollyStoryProps {
 *    stepOne: {
 *       copy: 'this is the first piece of text',
 *       image: imageSourceVariable1,
 *       altText: 'alt for first image',
 *     },
 *     stepTwo: {
 *       copy: 'this is the second piece of text',
 *       image: imageSourceVariable2,
 *       altText: 'alt for second image',
 *     },
 *     stepThree: {
 *       copy: 'this is the third piece of text',
 *       image: imageSourceVariable3,
 *       altText: 'alt for third image',
 *     }
 * }
 *
 */

const tempData = {
  stepOne: {
    copy: 'this is the first piece of text',
    image: {
      src: '~images/experiments/pooled_testing_00.jpg',
      altText: 'alt for first image',
    },
  },
  stepTwo: {
    copy: 'this is the second piece of text',
    image: '~images/experiments/pooled_testing_01.jpg',
    altText: 'alt for second image',
  },
  stepThree: {
    copy: 'this is the third piece of text',
    image: '~images/experiments/pooled_testing_02.jpg',
    altText: 'alt for third image',
  },
}

const ScrollyStory = ({ scrollyStoryProps = tempData }) => {
  const [currentImage, setCurrentImage] = useState(
    scrollyStoryProps.stepOne.image,
  )

  // const [scrollPosition, setScrollPosition] = useState(window.pageYOffset)

  return (
    <div className="scrollyContainer">
      <img
        className="scrollyImage"
        src={currentImage.src}
        alt={currentImage.altText}
      />
      {Object.keys(scrollyStoryProps).map(key => (
        <p>{scrollyStoryProps[key].copy}</p>
      ))}
    </div>
  )
}

export default ScrollyStory
