extends RefCounted

# Production PNGs are much larger than their mobile display bounds. Mipmap
# mipmap filtering avoids the single-level bilinear aliasing absent in browser art.
# Their .import settings must generate mipmaps; original PNG bytes stay unchanged.
static func configure(rect: TextureRect) -> void:
	rect.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
