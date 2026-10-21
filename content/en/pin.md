---
type: 'slide'
title: 'Pin'
params:
    headless: true
    target: 'https://github.com/foxihd/hugo-brewm'
---

This is a slide with `{{</* pin */>}}` shortcode.

## Pin it as Showcase (Example)

Section with `{{</* pin */>}}` shortcode.
The item order is column-based.
If images are not square, the layout will displayed as masonry style.

{{< pin "begin" >}}
{{< pin img="/images/flowlines/1.svg" label="Item 1">}}
{{< pin img="/images/flowlines/2.svg" label="Item 2">}}
{{< pin img="/images/flowlines/3.svg" label="Item 3">}}
{{< pin img="/images/flowlines/4.svg" label="Item 4">}}
{{< pin img="/images/flowlines/5.svg" label="Item 5">}}
{{< pin img="/images/flowlines/6.svg" label="Item 6">}}
{{< pin "end" >}}

## Pin it as Catalogue (Example)

`{{</* pin */>}}` shortcode with `quote` parameter.

{{< pin "begin" >}}
{{< pin img="/images/flowlines/7.svg" label="Item 1" url="#top?example=my-ecommerce" quote="<s>$299</s> $199" >}}
{{< pin img="/images/flowlines/8.svg" label="Item 2" url="#top?example=my-ecommerce" quote="<s>$399</s> $299" >}}
{{< pin img="/images/flowlines/9.svg" label="Item 3" url="#top?example=my-ecommerce" quote="Get Quote" >}}
{{< pin img="/images/flowlines/10.svg" label="Item 4" url="#top?example=my-ecommerce" quote="<s>$299</s> $199" >}}
{{< pin img="/images/flowlines/11.svg" label="Item 5" url="#top?example=my-ecommerce" quote="<s>$399</s> $299" >}}
{{< pin img="/images/flowlines/12.svg" label="Item 6" url="#top?example=my-ecommerce" quote="Out of stock" >}}
{{< pin "end" >}}
