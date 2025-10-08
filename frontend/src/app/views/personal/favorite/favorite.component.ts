import {Component, OnInit} from '@angular/core';
import {FavoriteService} from "../../../shared/services/favorite.service";
import {FavoriteType} from "../../../../types/favorite.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {environment} from "../../../../environments/environment";
import {CartService} from "../../../shared/services/cart.service";
import {CartType} from "../../../../types/cart.type";
import {FavoriteWithCartType} from "../../../../types/favoriteWithCart.type";

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit {

  products: FavoriteWithCartType[] = [];
  serverStaticPath = environment.serverStaticPath;
  cart: CartType | null = null;

  constructor(private favoriteService: FavoriteService, private cartService: CartService) {
  }

  ngOnInit(): void {
    this.favoriteService.getFavorites()
      .subscribe((data: FavoriteType[] | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          const error = (data as DefaultResponseType).message;
          throw new Error(error);
        }

        this.cartService.getCart()
          .subscribe((cartData: CartType | DefaultResponseType) => {
            if ((cartData as DefaultResponseType).error !== undefined) {
              throw new Error((data as DefaultResponseType).message);
            }
            this.cart = cartData as CartType;
            this.products = (data as FavoriteType[]).map((item) => {
              const cartItem = this.cart?.items.find(cartItem => cartItem.product.id === item.id);
              if (cartItem) {
                return {
                  ...item,
                  isInCart: true,
                  count: cartItem.quantity
                };
              }

              return {
                ...item,
                isInCart: false,
                count: 1
              };
            });
          });
      });
  }

  removeFromFavorites(id: string) {
    this.favoriteService.removeFavorite(id)
      .subscribe((data: DefaultResponseType) => {
        if (data.error) {

          throw new Error(data.message);
        }

        this.products = this.products.filter((item: FavoriteType) => item.id !== id);
      });
  }

  addToCart(product: FavoriteWithCartType): void {
    if (product.count) {
      this.cartService.updateCart(product.id, product.count)
        .subscribe((data: CartType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }
          product.isInCart = true;
        });
    }
  }

  removeFromCart(product: FavoriteWithCartType) {
    this.cartService.updateCart(product.id, 0)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        product.count = 1;
        product.isInCart = false;
      });
  }

  changeCount(product: FavoriteWithCartType, count: number) {
    product.count = count;
    this.cartService.updateCart(product.id, product.count)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
      });
  }

}
