/**
 * WordPress dependencies
 */
import { createBlock, parse, serialize } from '@wordpress/blocks';

function __experimentalAddWidgetIdToBlock( block, widgetId ) {
	return {
		...block,
		attributes: {
			...( block.attributes || {} ),
			__internalWidgetId: widgetId,
		},
	};
}

export function transformWidgetToBlock( widget ) {
	if ( widget.widget_class === 'WP_Widget_Block' ) {
		const parsedBlocks = parse( widget.settings.content );
		if ( ! parsedBlocks.length ) {
			return __experimentalAddWidgetIdToBlock(
				createBlock( 'core/paragraph', {}, [] ),
				widget.id
			);
		}
		return __experimentalAddWidgetIdToBlock( parsedBlocks[ 0 ], widget.id );
	}

	const attributes = {
		name: widget.name,
		form: widget.form,
		instance: widget.settings,
		idBase: widget.id_base,
		number: widget.number,
	};

	const isReferenceWidget = ! widget.widget_class;
	if ( isReferenceWidget ) {
		attributes.referenceWidgetName = widget.id;
	} else {
		attributes.widgetClass = widget.widget_class;
	}

	return __experimentalAddWidgetIdToBlock(
		createBlock( 'core/legacy-widget', attributes, [] ),
		widget.id
	);
}

export function transformBlockToWidget( block, relatedWidget = {} ) {
	const { name } = block;
	if ( name === 'core/legacy-widget' ) {
		let widget;
		if ( block.attributes.referenceWidgetName ) {
			widget = transformReferenceBlockToWidget( block, relatedWidget );
		} else {
			widget = transformClassBlockToWidget( block, relatedWidget );
		}
		delete widget.form;
		delete widget.rendered;
		return widget;
	}

	return {
		...relatedWidget,
		id_base: 'block',
		widget_class: 'WP_Widget_Block',
		settings: {
			content: serialize( block ),
		},
	};
}

function transformClassBlockToWidget( { attributes }, relatedWidget ) {
	return {
		...relatedWidget,
		widget_class: attributes.widgetClass,
		id_base: attributes.idBase,
		settings: attributes.instance,
	};
}

function transformReferenceBlockToWidget( { attributes }, relatedWidget ) {
	return {
		...relatedWidget,
		id: attributes.referenceWidgetName,
		settings: attributes.instance,
	};
}
