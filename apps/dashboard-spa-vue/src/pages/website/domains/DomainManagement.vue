<script lang="ts" setup>
import { pageTitle } from '@src/stores/layout.store';

pageTitle.value = 'Domains'
</script>

<template>
    <div class="space-y-6">
        <div>
            <h3 class="text-lg font-medium">Domain management</h3>
            <p class="text-sm text-muted-foreground">
                Use your own domain for free.
            </p>
            <!-- 
            
            help me build Domain management page,
            keep ui all components very small, simple and clean. try to keep it simple stupid (KISS)
            Do not add any external npm libs without asking, you can recommend them.

            expected features:
            - list domains
            - add btn to add your own domain
            - if user use own domain it should be validated with dns check.
            - Show a new page to add domain.
            - last domain added should be default hostname.
            - do not allow take already taken domain.
            - We can also offer single subdomain like name.cart5.com to make it easy to avoid dns configuration for testing,
            slugified_name+'.'+import.meta.env.VITE_PUBLIC_DOMAIN_NAME,
            in backend its env is PUBLIC_DOMAIN_NAME="cart5.com" ,
            in frontend its env is VITE_PUBLIC_DOMAIN_NAME="cart5.com" ,
            (do not allow multiple subdomains from our own domain, one subdomain per website),

             -->
        </div>
    </div>
</template>