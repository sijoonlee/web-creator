import configPromise from '@payload-config'
import { RootLayout } from '@payloadcms/next/layouts'
import React from 'react'

import { importMap } from './admin/importMap.js'
import { serverFunction } from './serverFunction'

type PayloadLayoutProps = {
  children: React.ReactNode
}

export default function PayloadLayout({ children }: PayloadLayoutProps) {
  return (
    <RootLayout
      config={configPromise}
      importMap={importMap}
      serverFunction={serverFunction}
    >
      {children}
    </RootLayout>
  )
}
