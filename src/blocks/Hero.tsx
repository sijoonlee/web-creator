import { z } from 'zod'

import { Button } from '@/components/Button'
import { Heading } from '@/components/Heading'
import { registerBlock } from './registerBlock'

export const heroSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  cta: z
    .object({
      label: z.string(),
      href: z.string()
    })
    .optional(),
  variant: z.enum(['center', 'split']).default('split')
})

function Hero(props: z.infer<typeof heroSchema>) {
  return (
    <section className={`hero ${props.variant}`}>
      <div>
        <Heading level={1}>{props.title}</Heading>
        {props.subtitle ? <p>{props.subtitle}</p> : null}
        {props.cta ? (
          <Button href={props.cta.href}>
            {props.cta.label}
          </Button>
        ) : null}
      </div>
      {props.variant === 'split' ? <div className="hero-media" /> : null}
    </section>
  )
}

export const HeroBlock = registerBlock({
  type: 'hero',
  label: 'Hero',
  schema: heroSchema,
  component: Hero
})
