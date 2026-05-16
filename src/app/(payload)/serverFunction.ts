'use server'

import configPromise from '@payload-config'
import { handleServerFunctions } from '@payloadcms/next/layouts'
import type { ServerFunctionClient } from 'payload'

import { importMap } from './admin/importMap.js'

export const serverFunction: ServerFunctionClient = async (args) =>
  handleServerFunctions({
    ...args,
    config: configPromise,
    importMap
  })
