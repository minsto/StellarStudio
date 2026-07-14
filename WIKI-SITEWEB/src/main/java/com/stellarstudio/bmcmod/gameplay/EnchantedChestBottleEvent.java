package com.stellarstudio.bmcmod.gameplay;

import com.stellarstudio.bmcmod.BmcMod;
import com.stellarstudio.bmcmod.block.chest.EnchantedChestBlockEntity;
import com.stellarstudio.bmcmod.registry.ModBlocks;

import net.minecraft.core.BlockPos;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.item.Items;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.neoforged.bus.api.SubscribeEvent;
import net.neoforged.fml.common.EventBusSubscriber;
import net.neoforged.neoforge.event.entity.player.PlayerInteractEvent;

@EventBusSubscriber(modid = BmcMod.MODID)
public final class EnchantedChestBottleEvent {
    private EnchantedChestBottleEvent() {
    }

    @SubscribeEvent
    public static void onRightClickBlock(PlayerInteractEvent.RightClickBlock event) {
        Player player = event.getEntity();
        Level level = event.getLevel();
        if (level.isClientSide() || !player.isShiftKeyDown() || !event.getItemStack().is(Items.GLASS_BOTTLE)) {
            return;
        }
        BlockPos pos = event.getPos();
        if (!level.getBlockState(pos).is(ModBlocks.ENCHANTED_CHEST.get())) {
            return;
        }
        BlockEntity be = level.getBlockEntity(pos);
        if (!(be instanceof EnchantedChestBlockEntity chest)) {
            return;
        }
        if (chest.tryBottleStorage(player, event.getItemStack(), event.getHand())) {
            event.setCanceled(true);
        }
    }
}
