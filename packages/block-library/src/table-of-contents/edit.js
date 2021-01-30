/**
 * External dependencies
 */
import { isEqual } from 'lodash';

/**
 * WordPress dependencies
 */
import {
	BlockIcon,
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';
import { PanelBody, Placeholder, ToggleControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import TableOfContentsList from './list';
import { getHeadingsFromContent, linearToNestedHeadingList } from './utils';

/**
 * Table of Contents block edit component.
 *
 * @param {Object}   props            The props.
 * @param {Object}   props.attributes The block attributes.
 * @param {boolean}  props.attributes.onlyIncludeCurrentPage
 * Whether to only include headings from the current page (if the post is
 * paginated).
 * @param {string}   props.clientId
 * @param {Function} props.setAttributes
 *
 * @return {WPComponent} The component.
 */
export default function TableOfContentsEdit( {
	attributes: { onlyIncludeCurrentPage },
	clientId,
	setAttributes,
} ) {
	const blockProps = useBlockProps();

	// Local state; not saved to block attributes. The saved block is dynamic and uses PHP to generate its content.
	const [ headings, setHeadings ] = useState( [] );

	const postContent = useSelect( ( select ) => {
		return select( 'core/editor' ).getEditedPostContent();
	}, [] );

	const pageIndex = useSelect(
		( select ) => {
			const {
				getBlockAttributes,
				getBlockIndex,
				getBlockName,
				getBlockOrder,
			} = select( 'core/block-editor' );

			const blockIndex = getBlockIndex( clientId );
			const blockOrder = getBlockOrder();

			// Calculate which page the block will appear in on the front-end by
			// counting how many <!--nextpage--> tags precede it.
			// Unfortunately, this implementation only accounts for Page Break and
			// Classic blocks, so if there are any <!--nextpage--> tags in any
			// other block, they won't be counted. This will result in the table
			// of contents showing headings from the wrong page if
			// onlyIncludeCurrentPage === true. Thankfully, this issue only
			// affects the editor implementation.
			let page = 1;
			for ( let i = 0; i < blockIndex; i++ ) {
				const blockName = getBlockName( blockOrder[ i ] );
				if ( blockName === 'core/nextpage' ) {
					page++;
				} else if ( blockName === 'core/freeform' ) {
					// Count the page breaks inside the Classic block.
					const pageBreaks = getBlockAttributes(
						blockOrder[ i ]
					).content.match( /<!--nextpage-->/g );

					if ( pageBreaks !== null ) {
						page += pageBreaks.length;
					}
				}
			}

			return page;
		},
		[ clientId ]
	);

	useEffect( () => {
		let latestHeadings;

		if ( onlyIncludeCurrentPage ) {
			const pagesOfContent = postContent.split( '<!--nextpage-->' );

			latestHeadings = getHeadingsFromContent(
				pagesOfContent[ pageIndex - 1 ]
			);
		} else {
			latestHeadings = getHeadingsFromContent( postContent );
		}

		if ( ! isEqual( headings, latestHeadings ) ) {
			setHeadings( latestHeadings );
		}
	}, [ pageIndex, postContent, onlyIncludeCurrentPage ] );

	const inspectorControls = (
		<InspectorControls>
			<PanelBody title={ __( 'Table of Contents settings' ) }>
				<ToggleControl
					label={ __( 'Only include current page' ) }
					checked={ onlyIncludeCurrentPage }
					onChange={ ( value ) =>
						setAttributes( { onlyIncludeCurrentPage: value } )
					}
					help={
						onlyIncludeCurrentPage
							? __(
									'Only including headings from the current page (if the post is paginated).'
							  )
							: __(
									'Toggle to only include headings from the current page (if the post is paginated).'
							  )
					}
				/>
			</PanelBody>
		</InspectorControls>
	);

	// If there are no headings or the only heading is empty.
	if ( headings.length === 0 || headings[ 0 ].content === '' ) {
		return (
			<div { ...blockProps }>
				{ inspectorControls }
				<Placeholder
					icon={ <BlockIcon icon="list-view" /> }
					label="Table of Contents"
					instructions={ __(
						'Start adding Heading blocks to create a table of contents. Headings with HTML anchors will be linked here.'
					) }
				/>
			</div>
		);
	}

	return (
		<nav { ...blockProps }>
			{ inspectorControls }
			<TableOfContentsList
				nestedHeadingList={ linearToNestedHeadingList( headings ) }
			/>
		</nav>
	);
}
