import { z } from 'zod'

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
        <h1>{props.title}</h1>
        {props.subtitle ? <p>{props.subtitle}</p> : null}
        {props.cta ? (
          <a className="button" href={props.cta.href}>
            {props.cta.label}
          </a>
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
