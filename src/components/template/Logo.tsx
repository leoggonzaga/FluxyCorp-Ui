import classNames from 'classnames'
import { APP_NAME } from '@/constants/app.constant'
import type { CommonProps } from '@/@types/common'

interface LogoProps extends CommonProps {
    type?: 'full' | 'streamline'
    mode?: 'light' | 'dark'
    imgClass?: string
    logoWidth?: number | string
}

const LOGO_SRC_PATH = '/img/logo/'

const Logo = (props: LogoProps) => {
    let { type = 'full', mode = 'light', className, imgClass, style, logoWidth = 'auto' } = props;

    // Garantir valores válidos
    const validTypes = ['full', 'streamline'];
    const validModes = ['light', 'dark'];
    if (!validTypes.includes(type)) type = 'full';
    if (!validModes.includes(mode)) mode = 'light';

    return (
        <div
            className={classNames('logo', className)}
            style={{
                ...style,
                ...{ width: logoWidth },
            }}
        >
            <img
                className={imgClass}
                src={`${LOGO_SRC_PATH}Odonto%20Branco_Direito.png`}
                alt="Odonto Branco logo"
                onError={e => {
                    e.currentTarget.src = `${LOGO_SRC_PATH}Odonto%20Branco_Direito.png`;
                }}
            />
        </div>
    )
}

export default Logo
