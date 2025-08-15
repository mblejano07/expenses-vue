<template>
    <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <img class="mx-auto h-10 w-auto" src="/images/blackpearl.png" alt="Blackpearl" />
        <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          <slot name="title">Form Title</slot>
        </h2>
      </div>
  
      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" @submit.prevent>
          <slot name="form-fields"></slot>
          <slot name="form-actions"></slot>
        </form>
        <p class="mt-4 text-center text-sm/6 text-red-600">
          <slot name="result"></slot>
        </p>
      </div>
    </div>
  </template>