import { UserInputError } from '@vtex/api'
import { FEED_ID } from '../constants/variables'

export const saveConfiguration = async (
  _: unknown,
  { config }: { config: Configuration },
  ctx: Context
) => {
  validateConfig(config)
  
  await ctx.clients.core.saveConfigInVBase(config,ctx.clients.vbase)

  const { affiliateId, salesChannel } = config

  await ctx.clients.sentOffers.createFeed({affiliateId, salesChannel, id: FEED_ID})
  .then( async () => {
    await ctx.clients.core.registerAffiliate(config,ctx)
    .catch((_) => { 
      throw new UserInputError("admin/app.error.affiliate.registerFail") 
    })
  })
  .catch( (_) => { throw new UserInputError("admin/vtex.sentOffers") })                     
}

const validateConfig = async (config: Configuration) => {
  const regexOnlyNumbers = /^[0-9]+$/
  const regexOnlyConsonants = /^[^AEIOU]{3}$/

  if (!regexOnlyNumbers.test(config.salesChannel)) {
    throw new UserInputError('admin/app.error.salesChannel.invalidFormat')
  }

  if (!regexOnlyConsonants.test(config.affiliateId)) {
    throw new UserInputError(
      'admin/app.error.affiliate.invalidFormat'
    )
  }
}
