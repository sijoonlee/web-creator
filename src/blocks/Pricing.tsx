import { z } from 'zod'

import { registerBlock } from './registerBlock'

export const pricingSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string(),
  plans: z.array(
    z.object({
      name: z.string(),
      price: z.string(),
      description: z.string()
    })
  )
})

function Pricing(props: z.infer<typeof pricingSchema>) {
  return (
    <section className="pricing">
      {props.eyebrow ? <p>{props.eyebrow}</p> : null}
      <h2>{props.title}</h2>
      <div className="pricing-grid">
        {props.plans.map((plan) => (
          <article className="pricing-plan" key={plan.name}>
            <h3>{plan.name}</h3>
            <div className="price">{plan.price}</div>
            <p>{plan.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export const PricingBlock = registerBlock({
  type: 'pricing',
  label: 'Pricing Table',
  schema: pricingSchema,
  component: Pricing
})
