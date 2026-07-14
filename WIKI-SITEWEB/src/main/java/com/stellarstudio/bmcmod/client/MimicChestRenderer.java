package com.stellarstudio.bmcmod.client;

import net.minecraft.client.renderer.entity.EntityRendererProvider;
import net.minecraft.client.renderer.entity.MobRenderer;
import net.minecraft.resources.ResourceLocation;

import com.stellarstudio.bmcmod.BmcMod;
import com.stellarstudio.bmcmod.entity.MimicChest;

public class MimicChestRenderer extends MobRenderer<MimicChest, MimicChestModel> {
    private static final ResourceLocation TEXTURE = ResourceLocation.fromNamespaceAndPath(BmcMod.MODID, "textures/entity/mob/mimic_chest.png");

    public MimicChestRenderer(EntityRendererProvider.Context context) {
        super(context, new MimicChestModel(context.bakeLayer(MimicChestModel.LAYER_LOCATION)), 0.42F);
    }

    @Override
    public ResourceLocation getTextureLocation(MimicChest entity) {
        return TEXTURE;
    }
}
