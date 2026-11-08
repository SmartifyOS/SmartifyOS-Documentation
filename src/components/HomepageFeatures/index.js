import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Made for Your Car',
    description: (
      <>
        Pick a layout and a theme, show your own car in 3D, and add the windows,
        tiles and widgets your car needs. Talk to its CAN bus, a reverse camera,
        GPS and the boards you built yourself.
      </>
    ),
  },
  {
    title: 'Click or Type',
    description: (
      <>
        Set up your car in the SmartifyOS Editor with a live preview, or with the{' '}
        <code>smartify-os</code> command line tool. Either way you never have to
        touch Flutter, git or adb yourself.
      </>
    ),
  },
  {
    title: 'Onto the Car on a USB Stick',
    description: (
      <>
        One stick installs SmartifyOS on a fresh Linux computer, and the next
        one updates it, firmware for your boards included. An Android tablet
        works too.
      </>
    ),
  },
];

function Feature({title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
