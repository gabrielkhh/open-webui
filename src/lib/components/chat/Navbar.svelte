<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import InlineSVG from 'svelte-inline-svg';

	import {
		WEBUI_NAME,
		chatId,
		mobile,
		settings,
		showArchivedChats,
		showControls,
		showSidebar,
		temporaryChatEnabled,
		user
	} from '$lib/stores';

	import { slide } from 'svelte/transition';
	import { page } from '$app/stores';

	import ShareChatModal from '../chat/ShareChatModal.svelte';
	import ModelSelector from '../chat/ModelSelector.svelte';
	import Tooltip from '../common/Tooltip.svelte';
	import Menu from '$lib/components/layout/Navbar/Menu.svelte';
	import UserMenu from '$lib/components/layout/Sidebar/UserMenu.svelte';
	import MenuLines from '../icons/MenuLines.svelte';
	import AdjustmentsHorizontal from '../icons/AdjustmentsHorizontal.svelte';

	import PencilSquare from '../icons/PencilSquare.svelte';
	import { getOpenRouterCredits } from '$lib/apis/openrouter';
	import { getOpenAIConfig } from '$lib/apis/openai';

	const i18n = getContext('i18n');

	export let initNewChat: Function;
	export let title: string = $WEBUI_NAME;
	export let shareEnabled: boolean = false;
	export let openRouterPresent: boolean = true;

	export let chat;
	export let selectedModels;
	export let showModelSelector = true;

	let showShareChatModal = false;
	let showDownloadChatModal = false;

	let openRouterCredits: string | null = null;

	// Custom Credits Overlay
	onMount(async () => {
		let openaiConfig = {};
		let OPENAI_API_KEYS = [''];
		let OPENAI_API_BASE_URLS = [''];

		await Promise.all([
			(async () => {
				openaiConfig = await getOpenAIConfig(localStorage.token);
			})()
		]);

		if (openaiConfig) {
			OPENAI_API_BASE_URLS = openaiConfig.OPENAI_API_BASE_URLS;
			OPENAI_API_KEYS = openaiConfig.OPENAI_API_KEYS;

			// Sort out the URLs and Keys first, taken from Connections.svelte
			// Remove trailing slashes
			OPENAI_API_BASE_URLS = OPENAI_API_BASE_URLS.map((url) => url.replace(/\/$/, ''));

			// Check if API KEYS length is same than API URLS length
			if (OPENAI_API_KEYS.length !== OPENAI_API_BASE_URLS.length) {
				// if there are more keys than urls, remove the extra keys
				if (OPENAI_API_KEYS.length > OPENAI_API_BASE_URLS.length) {
					OPENAI_API_KEYS = OPENAI_API_KEYS.slice(0, OPENAI_API_BASE_URLS.length);
				}

				// if there are more urls than keys, add empty keys
				if (OPENAI_API_KEYS.length < OPENAI_API_BASE_URLS.length) {
					const diff = OPENAI_API_BASE_URLS.length - OPENAI_API_KEYS.length;
					for (let i = 0; i < diff; i++) {
						OPENAI_API_KEYS.push('');
					}
				}
			}

			// Find the key of the first instance of OpenRouter in the list
			const openRouterIndex = OPENAI_API_BASE_URLS.findIndex((url) =>
				url.includes('openrouter.ai')
			);
			const openRouterApiKey = openRouterIndex !== -1 ? OPENAI_API_KEYS[openRouterIndex] : '';

			if (openRouterIndex !== -1) {
				const openRouterCreditsResponse = await getOpenRouterCredits(openRouterApiKey).catch((error) => {
						toast.error(`${error}`);
				});

				if (openRouterCreditsResponse) {
					openRouterCredits = (
						Number(openRouterCreditsResponse.data['total_credits'] ?? 0) -
						Number(openRouterCreditsResponse.data['total_usage'] ?? 0)
					).toFixed(2);
				}
			}
		}
	});
</script>

<ShareChatModal bind:show={showShareChatModal} chatId={$chatId} />

<nav class="sticky top-0 z-30 w-full px-1.5 py-1.5 -mb-8 flex items-center drag-region">
	<div
		class=" bg-linear-to-b via-50% from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 dark:to-transparent pointer-events-none absolute inset-0 -bottom-7 z-[-1]"
	></div>

	<div class=" flex max-w-full w-full mx-auto px-1 pt-0.5 bg-transparent">
		<div class="flex items-center w-full max-w-full">
			<div
				class="{$showSidebar
					? 'md:hidden'
					: ''} mr-1 self-start flex flex-none items-center text-gray-600 dark:text-gray-400"
			>
				<button
					id="sidebar-toggle-button"
					class="cursor-pointer px-2 py-2 flex rounded-xl hover:bg-gray-50 dark:hover:bg-gray-850 transition"
					on:click={() => {
						showSidebar.set(!$showSidebar);
					}}
					aria-label="Toggle Sidebar"
				>
					<div class=" m-auto self-center">
						<MenuLines />
					</div>
				</button>
			</div>

			<div
				class="flex-1 overflow-hidden max-w-full py-0.5
			{$showSidebar ? 'ml-1' : ''}
			"
			>
				{#if showModelSelector}
					<ModelSelector bind:selectedModels showSetDefault={!shareEnabled} />
				{/if}
			</div>

			<div class="self-start flex flex-none items-center text-gray-600 dark:text-gray-400">
				<!-- <div class="md:hidden flex self-center w-[1px] h-5 mx-2 bg-gray-300 dark:bg-stone-700" /> -->
				{#if openRouterPresent && openRouterCredits !== null}
					<div class="flex items-center">
						<span
							class="inline-flex items-center px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full"
						>
							<!-- <InlineSVG src={"../../../../static/openrouter.svg"} class="w-4 h-4 mr-1" /> -->
							<!-- <svg
								class="w-4 h-4 mr-1"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>

								<path
									d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"
								></path>
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
									clip-rule="evenodd"
								></path>
							</svg> -->
							${openRouterCredits}
						</span>
					</div>
				{/if}

				{#if shareEnabled && chat && (chat.id || $temporaryChatEnabled)}
					<Menu
						{chat}
						{shareEnabled}
						shareHandler={() => {
							showShareChatModal = !showShareChatModal;
						}}
						downloadHandler={() => {
							showDownloadChatModal = !showDownloadChatModal;
						}}
					>
						<button
							class="flex cursor-pointer px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-850 transition"
							id="chat-context-menu-button"
						>
							<div class=" m-auto self-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="size-5"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
									/>
								</svg>
							</div>
						</button>
					</Menu>
				{/if}

				<Tooltip content={$i18n.t('Controls')}>
					<button
						class=" flex cursor-pointer px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-850 transition"
						on:click={async () => {
							await showControls.set(!$showControls);
						}}
						aria-label="Controls"
					>
						<div class=" m-auto self-center">
							<AdjustmentsHorizontal className=" size-5" strokeWidth="0.5" />
						</div>
					</button>
				</Tooltip>

				<Tooltip content={$i18n.t('New Chat')}>
					<button
						id="new-chat-button"
						class=" flex {$showSidebar
							? 'md:hidden'
							: ''} cursor-pointer px-2 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850 transition"
						on:click={() => {
							initNewChat();
						}}
						aria-label="New Chat"
					>
						<div class=" m-auto self-center">
							<PencilSquare className=" size-5" strokeWidth="2" />
						</div>
					</button>
				</Tooltip>

				{#if $user !== undefined}
					<UserMenu
						className="max-w-[200px]"
						role={$user.role}
						on:show={(e) => {
							if (e.detail === 'archived-chat') {
								showArchivedChats.set(true);
							}
						}}
					>
						<button
							class="select-none flex rounded-xl p-1.5 w-full hover:bg-gray-50 dark:hover:bg-gray-850 transition"
							aria-label="User Menu"
						>
							<div class=" self-center">
								<img
									src={$user.profile_image_url}
									class="size-6 object-cover rounded-full"
									alt="User profile"
									draggable="false"
								/>
							</div>
						</button>
					</UserMenu>
				{/if}
			</div>
		</div>
	</div>
</nav>
