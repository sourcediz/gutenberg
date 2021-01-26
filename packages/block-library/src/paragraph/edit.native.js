/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { createBlock } from '@wordpress/blocks';
import {
	AlignmentToolbar,
	BlockControls,
	RichText,
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';

const name = 'core/paragraph';

function ParagraphBlock( {
	attributes,
	mergeBlocks,
	onReplace,
	setAttributes,
	mergedStyle,
	style,
	clientId,
} ) {
	const isRTL = useSelect( ( select ) => {
		return !! select( 'core/block-editor' ).getSettings().isRTL;
	}, [] );

	const { align, content, placeholder } = attributes;

	const styles = {
		...mergedStyle,
		...style,
	};

	return (
		<>
			<BlockControls>
				<AlignmentToolbar
					value={ align }
					isRTL={ isRTL }
					onChange={ ( nextAlign ) => {
						setAttributes( { align: nextAlign } );
					} }
				/>
			</BlockControls>
			<RichText
				identifier="content"
				tagName="p"
				value={ content }
				deleteEnter={ true }
				style={ styles }
				onChange={ ( nextContent ) => {
					setAttributes( {
						content: nextContent,
					} );
				} }
				onSplit={ ( value, isOriginal ) => {
					let newAttributes;

					if ( isOriginal || value ) {
						newAttributes = {
							...attributes,
							content: value,
						};
					}

					const block = createBlock( name, newAttributes );

					if ( isOriginal ) {
						block.clientId = clientId;
					}

					return block;
				} }
				onMerge={ mergeBlocks }
				onReplace={ onReplace }
				onRemove={ onReplace ? () => onReplace( [] ) : undefined }
				placeholder={ placeholder || __( 'Start writing…' ) }
				textAlign={ align }
			/>
		</>
	);
}

export default ParagraphBlock;
