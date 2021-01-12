/**
 * External dependencies
 */
import { Text, View } from 'react-native';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Image, RangeControl } from '@wordpress/components';
import { Path, SVG } from '@wordpress/primitives';

/**
 * Internal dependencies
 */
import styles from './style.scss';

const MIN_POSITION_VALUE = 0;
const MAX_POSITION_VALUE = 100;

export default function FocalPointPicker( { focalPoint, onChange, url } ) {
	const { x, y } = focalPoint;

	function setAxisPostion( axis ) {
		return ( pos ) => {
			onChange( {
				...focalPoint,
				[ axis ]: pos / 100,
			} );
		};
	}

	return (
		<View style={ styles.container }>
			<View style={ [ styles.media ] }>
				<Image url={ url } width={ styles.image.width } />
				<View
					style={ [
						styles.focalPointWrapper,
						// TODO(David): Update coordinates with state
						{ top: '50%', left: '50%' },
					] }
				>
					<SVG
						style={ styles.focalPointIcon }
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 30 30"
					>
						<Path
							style={ styles.focalPointIconPathOutline }
							d="M15 1C7.3 1 1 7.3 1 15s6.3 14 14 14 14-6.3 14-14S22.7 1 15 1zm0 22c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"
						/>
						<Path
							style={ styles.focalPointIconPathFill }
							d="M15 3C8.4 3 3 8.4 3 15s5.4 12 12 12 12-5.4 12-12S21.6 3 15 3zm0 22C9.5 25 5 20.5 5 15S9.5 5 15 5s10 4.5 10 10-4.5 10-10 10z"
						/>
					</SVG>
				</View>
			</View>
			<RangeControl
				value={ x * 100 }
				label={ __( 'X-Axis Position' ) }
				min={ MIN_POSITION_VALUE }
				max={ MAX_POSITION_VALUE }
				initialPosition={ x * 100 }
				allowReset
				onChange={ setAxisPostion( 'x' ) }
			/>
			<RangeControl
				value={ y * 100 }
				label={ __( 'Y-Axis Position' ) }
				min={ MIN_POSITION_VALUE }
				max={ MAX_POSITION_VALUE }
				initialPosition={ y * 100 }
				allowReset
				onChange={ setAxisPostion( 'y' ) }
			/>
		</View>
	);
}